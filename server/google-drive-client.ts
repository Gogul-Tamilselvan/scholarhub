import { google } from 'googleapis';
import { Readable } from 'stream';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings?.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken || !hostname) {
    throw new Error('Replit connector environment not configured');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-drive',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Drive not connected. Please set up the Google Drive integration in Replit.');
  }
  return accessToken;
}

async function getGoogleDriveClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

function extractFolderIdFromUrl(folderIdOrUrl: string): string {
  if (folderIdOrUrl.includes('/folders/')) {
    const match = folderIdOrUrl.match(/\/folders\/([^/?]+)/);
    if (match) {
      return match[1];
    }
  }
  return folderIdOrUrl;
}

export async function uploadFileToGoogleDrive(file: { buffer: Buffer; originalname: string; mimetype: string }) {
  try {
    const drive = await getGoogleDriveClient();
    const folderId = await getOrCreateManuscriptFolder();

    const fileMetadata = {
      name: `${Date.now()}-${file.originalname}`,
      parents: [folderId]
    };

    const media = {
      mimeType: file.mimetype,
      body: Readable.from(file.buffer)
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink'
    });

    const fileId = response.data.id;
    const fileUrl = response.data.webViewLink || response.data.webContentLink || `https://drive.google.com/file/d/${fileId}/view`;

    // Make the file accessible via link
    try {
      await drive.permissions.create({
        fileId: fileId!,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });
    } catch (permError) {
      console.warn('Failed to set public permissions on manuscript:', permError);
    }

    console.log(`✅ File uploaded to Google Drive: ${file.originalname} (${fileId})`);
    console.log(`📎 File URL: ${fileUrl}`);

    return {
      id: fileId,
      name: file.originalname,
      url: fileUrl
    };
  } catch (error: any) {
    console.error('❌ Error uploading file to Google Drive:', error.message);
    throw new Error(`Failed to upload file to Google Drive: ${error.message}`);
  }
}

export async function getOrCreateInvoiceFolder() {
  try {
    const drive = await getGoogleDriveClient();
    
    let invoiceFolderId = process.env.GOOGLE_INVOICE_FOLDER_ID;
    
    if (invoiceFolderId) {
      invoiceFolderId = extractFolderIdFromUrl(invoiceFolderId);
      console.log(`📁 Using invoice folder ID: ${invoiceFolderId}`);
      
      try {
        const folderCheck = await drive.files.get({
          fileId: invoiceFolderId,
          fields: 'id, name, mimeType'
        });
        console.log(`✅ Invoice folder verified: ${folderCheck.data.name} (${invoiceFolderId})`);
        return invoiceFolderId;
      } catch (verifyError: any) {
        console.error(`⚠️ Cannot access invoice folder ${invoiceFolderId}:`, verifyError.message);
        if (verifyError.code === 404) {
          throw new Error(`Invoice folder not found: ${invoiceFolderId}. Please check GOOGLE_INVOICE_FOLDER_ID.`);
        } else if (verifyError.code === 403) {
          throw new Error(`Permission denied for invoice folder ${invoiceFolderId}. The account needs access to this folder.`);
        }
        throw verifyError;
      }
    }
    
    const folderName = 'Scholar India Invoices';
    console.log(`📁 Searching for folder: ${folderName}...`);
    const searchResponse = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    if (searchResponse.data.files && searchResponse.data.files.length > 0) {
      const folderId = searchResponse.data.files[0].id!;
      console.log(`📁 Found existing folder: ${folderName} (${folderId})`);
      return folderId;
    }

    console.log(`📁 Creating new folder: ${folderName}`);
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id, name'
    });

    const newFolderId = folder.data.id!;
    console.log(`✅ Created new folder: ${folderName} (${newFolderId})`);
    
    return newFolderId;
  } catch (error: any) {
    console.error('❌ Error in invoice folder:', error.message);
    throw error;
  }
}

export async function uploadInvoiceToGoogleDrive(invoiceBuffer: Buffer, invoiceName: string) {
  try {
    const drive = await getGoogleDriveClient();
    const folderId = await getOrCreateInvoiceFolder();

    const fileMetadata = {
      name: invoiceName,
      parents: [folderId],
      mimeType: 'application/pdf'
    };

    const media = {
      mimeType: 'application/pdf',
      body: Readable.from(invoiceBuffer)
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink'
    });

    const fileId = response.data.id;
    const fileUrl = response.data.webViewLink || response.data.webContentLink;

    console.log(`✅ Invoice uploaded to Google Drive: ${invoiceName} (${fileId})`);
    return {
      id: fileId,
      name: invoiceName,
      url: fileUrl
    };
  } catch (error: any) {
    console.error('❌ Error uploading invoice:', error.message);
    throw new Error(`Failed to upload invoice: ${error.message}`);
  }
}

export async function getOrCreateManuscriptFolder() {
  try {
    const drive = await getGoogleDriveClient();
    
    let folderIdFromEnv = process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    if (folderIdFromEnv) {
      folderIdFromEnv = extractFolderIdFromUrl(folderIdFromEnv);
      console.log(`📁 Using folder ID from environment: ${folderIdFromEnv}`);
      
      try {
        const folderCheck = await drive.files.get({
          fileId: folderIdFromEnv,
          fields: 'id, name, mimeType'
        });
        console.log(`✅ Folder verified: ${folderCheck.data.name} (${folderIdFromEnv})`);
        return folderIdFromEnv;
      } catch (verifyError: any) {
        console.error(`❌ Cannot access folder ${folderIdFromEnv}:`, verifyError.message);
        if (verifyError.code === 404) {
          throw new Error(`Folder not found: ${folderIdFromEnv}. Please check the GOOGLE_DRIVE_FOLDER_ID value.`);
        } else if (verifyError.code === 403) {
          throw new Error(`Permission denied for folder ${folderIdFromEnv}. Please ensure the Google Drive connection has access to this folder.`);
        }
        throw verifyError;
      }
    }
    
    const folderName = 'Scholar India Manuscripts';
    console.log(`📁 Searching for folder: ${folderName}...`);
    const searchResponse = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    if (searchResponse.data.files && searchResponse.data.files.length > 0) {
      const folderId = searchResponse.data.files[0].id!;
      console.log(`📁 Found existing folder: ${folderName} (${folderId})`);
      return folderId;
    }

    console.log(`📁 Creating new folder: ${folderName}`);
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id, name'
    });

    const newFolderId = folder.data.id!;
    console.log(`✅ Created new folder: ${folderName} (${newFolderId})`);
    console.log(`💡 TIP: You can set GOOGLE_DRIVE_FOLDER_ID=${newFolderId} to use a specific folder`);
    
    return newFolderId;
  } catch (error: any) {
    console.error('❌ Error in getOrCreateManuscriptFolder:', error);
    if (error.code === 403) {
      console.error('🚫 Permission denied: The Google Drive connection may not have proper access.');
    } else if (error.code === 401) {
      console.error('🔑 Authentication failed: Access token may be expired or invalid.');
    }
    throw error;
  }
}

// Upload review form to specific Google Drive folder
export async function uploadReviewFormToGoogleDrive(file: { buffer: Buffer; originalname: string; mimetype: string }, fileName: string) {
  try {
    const drive = await getGoogleDriveClient();
    
    // Use the specific reviewer forms folder
    const reviewFormsFolderId = '1td1X9ttatLLcGzDpFc74WQanYcsyFoH3';

    const fileMetadata = {
      name: fileName,
      parents: [reviewFormsFolderId]
    };

    const media = {
      mimeType: file.mimetype || 'application/pdf',
      body: Readable.from(file.buffer)
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink'
    });

    const fileId = response.data.id;

    // Make the file accessible via link
    await drive.permissions.create({
      fileId: fileId!,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    const fileUrl = response.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;

    console.log(`✅ Review form uploaded to Google Drive: ${fileName} (${fileId})`);
    console.log(`📎 File URL: ${fileUrl}`);

    return {
      id: fileId,
      name: fileName,
      url: fileUrl
    };
  } catch (error: any) {
    console.error('❌ Error uploading review form to Google Drive:', error.message);
    throw new Error(`Failed to upload review form to Google Drive: ${error.message}`);
  }
}

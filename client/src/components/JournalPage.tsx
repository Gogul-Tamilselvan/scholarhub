import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Archive, Edit, Send } from "lucide-react";

interface JournalPageProps {
  title: string;
  aim: string;
  scope: string;
  publicationTypes: string;
  researchFocus: string;
  targetAudience: string;
}

export default function JournalPage({
  title,
  aim,
  scope,
  publicationTypes,
  researchFocus,
  targetAudience,
}: JournalPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
            {title}
          </h1>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button
              variant="outline"
              className="bg-card text-card-foreground"
              data-testid="button-current-issue"
            >
              <FileText className="h-4 w-4 mr-2" />
              📖 Current Issue
            </Button>
            <Button
              variant="outline"
              className="bg-card text-card-foreground"
              data-testid="button-archives"
            >
              <Archive className="h-4 w-4 mr-2" />
              🗂 Archives
            </Button>
            <Button
              variant="outline"
              className="bg-card text-card-foreground"
              data-testid="button-guidelines"
            >
              <Edit className="h-4 w-4 mr-2" />
              📜 Author Guidelines
            </Button>
            <Button
              className="bg-primary text-primary-foreground"
              data-testid="button-submit-manuscript"
            >
              <Send className="h-4 w-4 mr-2" />
              ✍️ Submit Manuscript
            </Button>
          </div>
        </div>

        <div className="grid gap-8">
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Aim</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">{aim}</p>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Scope</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">{scope}</p>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">
                Publication Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">{publicationTypes}</p>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">
                Research Focus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">{researchFocus}</p>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">
                Target Audience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">{targetAudience}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

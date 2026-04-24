/**
 * Centralized configuration for the Scholar India Publishers frontend.
 * This file pulls settings from environment variables and provides them to the application.
 */

// Use import.meta.env for Vite projects
export const MAIL_SERVER_URL = import.meta.env.VITE_MAIL_SERVER_URL || "https://sipmails.vercel.app";
export const MAIL_API_KEY = import.meta.env.VITE_MAIL_API_KEY || "scholar_india_mail_secret_2026";

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

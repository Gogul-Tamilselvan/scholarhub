-- Run this in Supabase SQL Editor to add Abstract and PDF URL columns to journal_articles
-- Go to: Supabase Dashboard → SQL Editor → New Query → Paste & Run

ALTER TABLE public.journal_articles 
  ADD COLUMN IF NOT EXISTS abstract text,
  ADD COLUMN IF NOT EXISTS pdf_url text;

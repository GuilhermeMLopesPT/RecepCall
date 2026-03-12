-- Add summary column to calls table (for AI-generated call summaries)
alter table public.calls add column if not exists summary text;

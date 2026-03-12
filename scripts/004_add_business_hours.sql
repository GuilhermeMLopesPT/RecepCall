-- Add email and business_hours to businesses table
-- Run this in the Supabase SQL Editor

alter table public.businesses
  add column if not exists email text,
  add column if not exists business_hours jsonb default '{
    "monday":    {"open": true,  "start": "09:00", "end": "18:00"},
    "tuesday":   {"open": true,  "start": "09:00", "end": "18:00"},
    "wednesday": {"open": true,  "start": "09:00", "end": "18:00"},
    "thursday":  {"open": true,  "start": "09:00", "end": "18:00"},
    "friday":    {"open": true,  "start": "09:00", "end": "18:00"},
    "saturday":  {"open": false, "start": "09:00", "end": "13:00"},
    "sunday":    {"open": false, "start": "09:00", "end": "13:00"}
  }'::jsonb;

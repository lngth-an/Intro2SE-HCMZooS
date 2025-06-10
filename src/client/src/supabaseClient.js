import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cylpzmvdcyhkvghdeelb.supabase.co'; // Thay bằng Project URL của bạn
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5bHB6bXZkY3loa3ZnaGRlZWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MzIwNTQsImV4cCI6MjA2NDQwODA1NH0.BZf1ndEMB2bmTVs2DvnWVocujvKgQz1LwcGjd9FKOsU';
export const supabase = createClient(supabaseUrl, supabaseKey);
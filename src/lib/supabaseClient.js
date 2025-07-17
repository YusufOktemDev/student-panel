import { createClient } from "@supabase/supabase-js";

// DOĞRU URL VE ANON KEY'İ BURAYA GİR
const supabaseUrl = "https://iublanexqarpgujzqqey.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1YmxhbmV4cWFycGd1anpxcWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzNzY4NDksImV4cCI6MjA2MTk1Mjg0OX0.lKmi_IfBlMTgFzSyfYOiUn9gsmRjnYUWLEppWQH-tyI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

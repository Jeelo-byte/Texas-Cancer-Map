import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gmmbsjxobfpybjutggcc.supabase.co"; // Replace with your Project URL
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtbWJzanhvYmZweWJqdXRnZ2NjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODU3NjYsImV4cCI6MjA2NzY2MTc2Nn0.Eku1hS9-8vbiZ1Ta9BHCzvthWXlrpieWHi2IzQh5vjs"; // Replace with your anon public API key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

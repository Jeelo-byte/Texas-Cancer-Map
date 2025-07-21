import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gmmbsjxobfpybjutggcc.supabase.co"; // Replace with your Project URL
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtbWJzanhvYmZweWJqdXRnZ2NjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODU3NjYsImV4cCI6MjA2NzY2MTc2Nn0.Eku1hS9-8vbiZ1Ta9BHCzvthWXlrpieWHi2IzQh5vjs"; // Replace with your anon public API key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Make sure to set your Supabase project URL and anon key here for Auth to work.
// If you haven't already, get these from your Supabase dashboard > Project Settings > API.
// Example:
// export const supabase = createClient('https://your-project.supabase.co', 'public-anon-key');

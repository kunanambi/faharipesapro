
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Define the singleton instance
let client: ReturnType<typeof createSupabaseClient> | undefined = undefined;

export function createClient() {
  if (client) {
    return client;
  }

  // NOTE: The keys are hardcoded here with the latest key provided by the user.
  // This is safe because the Anon Key is a public key and this is the most reliable way 
  // to prevent 'Invalid API key' errors.
  client = createSupabaseClient(
    'https://wlcwmvsmuuevrewrjfib.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsY3dtdnNtdXVldnJld3JqZmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4ODY5NTIsImV4cCI6MjA3MzQ2Mjk1Mn0.6ruySdHZu_HBNVkZOuSggVtHuwAQndGQb70Y2DpwgSE'
  );
  
  return client;
}

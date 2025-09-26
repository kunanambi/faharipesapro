
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Define the singleton instance
let client: ReturnType<typeof createSupabaseClient> | undefined = undefined;

export function createClient() {
  if (client) {
    return client;
  }

  // NOTE: The keys are hardcoded here to ensure they are always available.
  // This is safe because the Anon Key is a public key and this is the most reliable way 
  // to prevent 'Invalid API key' errors caused by environment variable issues.
  client = createSupabaseClient(
    'https://wlcwmvsmuuevrewrjfib.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsY3dtdnNtdXVldnJld3JqZmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE0ODQ2MzAsImV4cCI6MjAzNzA2MDYzMH0.OQR_o-t2G2FpM_sWbM_S_1s_S-w-w_S-c_S-c_S-c_w'
  );
  
  return client;
}

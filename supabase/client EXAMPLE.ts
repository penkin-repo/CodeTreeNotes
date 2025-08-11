
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types';

// IMPORTANT: Replace with your actual Supabase URL and Anon Key
// You can find these in your Supabase project settings under "API".
const supabaseUrl = '-----';
const supabaseAnonKey = '-----';

// A simple check to remind the user to replace the placeholder credentials.
// In a real-world application, you would use environment variables.
if (supabaseUrl === '-----' || supabaseAnonKey === '-----') {
  // We console.warn here to allow the UI to render a more user-friendly error message.
  // The useTree hook will catch the actual connection error from Supabase.
  console.warn(`Supabase credentials are not configured. The app will not connect to the database.
Please update YOUR_SUPABASE_URL and YOUR_SUPABASE_ANON_KEY in supabase/client.ts`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

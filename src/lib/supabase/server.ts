
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = "https://wlcwmvsmuuevrewrjfib.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsY3dtdnNtdXVldnJld3JqZmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4ODY5NTIsImV4cCI6MjA3MzQ2Mjk1Mn0.6ruySdHZu_HBNVkZOuSggVtHuwAQndGQb70Y2DpwgSE";


export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export function createAdminClient() {
    const cookieStore = cookies()

    // IMPORTANT: The admin client requires the SERVICE_ROLE_KEY, not the anon key.
    // Using the anon key here will result in permission errors for admin tasks.
    // You must replace process.env.SUPABASE_SERVICE_ROLE_KEY with your actual service role key.
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set. This is required for admin operations.');
    }

    return createServerClient(
        supabaseUrl,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
             cookies: {
                get(name: string) {
                return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                try {
                    cookieStore.set({ name, value, ...options })
                } catch (error) {
                    // The `set` method was called from a Server Component.
                    // This can be ignored if you have middleware refreshing
                    // user sessions.
                }
                },
                remove(name: string, options: CookieOptions) {
                try {
                    cookieStore.set({ name, value: '', ...options })
                } catch (error) {
                    // The `delete` method was called from a Server Component.
                    // This can be ignored if you have middleware refreshing
                    // user sessions.
                }
                },
            },
        }
    );
}

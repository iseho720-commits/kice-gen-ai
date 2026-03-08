import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

/**
 * Admin Supabase client — uses Service Role Key.
 * NEVER expose this on the client side.
 * Use ONLY in server-side contexts (API routes, Server Actions)
 * for operations that require bypassing RLS (e.g., payment verification).
 */
export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
        throw new Error(
            'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable.'
        );
    }

    return createSupabaseClient<Database>(url, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

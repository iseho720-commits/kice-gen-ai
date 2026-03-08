import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database';

export const isSupabaseConfigured = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    return createBrowserClient<Database>(
        url ?? 'https://placeholder.supabase.co',
        anonKey ?? 'placeholder'
    );
}

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Diagnostic endpoint — visit /api/health in browser to check config.
 */
export async function GET() {
    const checks: Record<string, string> = {};

    // 1. Environment variables
    checks['NEXT_PUBLIC_SUPABASE_URL'] = process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ SET' : '❌ MISSING';
    checks['NEXT_PUBLIC_SUPABASE_ANON_KEY'] = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ SET' : '❌ MISSING';
    checks['SUPABASE_SERVICE_ROLE_KEY'] = process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ SET' : '❌ MISSING';
    checks['GEMINI_API_KEY'] = process.env.GEMINI_API_KEY ? '✅ SET' : '❌ MISSING';

    // 2. Supabase connection test
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.from('profiles').select('id').limit(1);
        if (error) {
            checks['SUPABASE_CONNECTION'] = `❌ ERROR: ${error.message}`;
        } else {
            checks['SUPABASE_CONNECTION'] = `✅ OK (found ${data?.length ?? 0} rows)`;
        }
    } catch (e: any) {
        checks['SUPABASE_CONNECTION'] = `❌ CRASH: ${e?.message}`;
    }

    // 3. Auth session test
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            checks['AUTH_SESSION'] = `⚠️ No session (expected if not logged in): ${error.message}`;
        } else if (user) {
            checks['AUTH_SESSION'] = `✅ Logged in as ${user.email}`;
        } else {
            checks['AUTH_SESSION'] = '⚠️ No active session';
        }
    } catch (e: any) {
        checks['AUTH_SESSION'] = `❌ CRASH: ${e?.message}`;
    }

    return NextResponse.json({ status: 'health-check', checks }, { status: 200 });
}

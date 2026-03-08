import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

        // Activate weekly pass on profile
        const { error } = await supabase
            .from('profiles')
            .update({ has_active_pass: true })
            .eq('id', user.id);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        // Record purchase
        await supabase.from('purchases').insert({
            user_id: user.id,
            passage_id: null as unknown as string, // no specific passage for passes
            amount: 9900,
            type: 'weekly_pass',
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('[/api/purchase-pass]', err);
        return NextResponse.json({ error: '서버 오류' }, { status: 500 });
    }
}

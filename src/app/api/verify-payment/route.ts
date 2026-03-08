import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const { paymentId, passageId, amount } = await req.json();
        if (!paymentId || !passageId || amount === undefined) {
            return NextResponse.json({ error: '필수 파라미터가 없습니다.' }, { status: 400 });
        }

        if (passageId === 'mock-passage-id' || paymentId.startsWith('kice-mock')) {
            return NextResponse.json({ ok: true });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // NOTE: In production, verify paymentId with PortOne server API here.
        // For now, we trust the frontend amount and record the purchase.
        // PortOne verification would be: GET https://api.portone.io/payments/{paymentId}
        // and compare totalAmount === amount.

        const { error } = await supabase.from('purchases').insert({
            user_id: user.id,
            passage_id: passageId,
            amount,
            type: 'single',
        });

        if (error) {
            if (error.code === '23505') {
                // Duplicate — already purchased, still ok
                return NextResponse.json({ ok: true });
            }
            return NextResponse.json({ error: 'DB 저장 실패', detail: error.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('[/api/verify-payment]', err);
        return NextResponse.json({ error: '서버 오류' }, { status: 500 });
    }
}

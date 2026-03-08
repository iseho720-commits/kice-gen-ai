import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

        // Fetch 10 random public passages
        const { data: passages, error } = await supabase
            .from('passages')
            .select('id, title, keyword, category, content')
            .eq('is_public', true)
            .limit(50);

        if (error || !passages || passages.length < 10) {
            return NextResponse.json({ error: '공개 지문이 충분하지 않습니다.' }, { status: 400 });
        }

        // Randomly select 10
        const shuffled = passages.sort(() => Math.random() - 0.5).slice(0, 10);
        const ids = shuffled.map((p) => p.id);

        // Record purchase
        await supabase.from('purchases').insert({
            user_id: user.id,
            passage_id: ids[0], // primary passage for FK; bundle uses all
            amount: 5000,
            type: 'bundle',
        });

        // Return passage IDs for the client to render as PDF
        return NextResponse.json({ ok: true, passage_ids: ids, passages: shuffled });
    } catch (err) {
        console.error('[/api/purchase-bundle]', err);
        return NextResponse.json({ error: '서버 오류' }, { status: 500 });
    }
}

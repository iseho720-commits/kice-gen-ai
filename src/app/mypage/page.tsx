import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import MyPageClient from './MyPageClient';
import { DbProfile } from '@/types/database';

export default async function MyPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/?error=not_logged_in');

    const [profileRes, purchasesRes, publicPassagesCountRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user!.id).single(),
        supabase.from('purchases').select('*, passages(id, title, keyword, category, created_at)').eq('user_id', user!.id).order('created_at', { ascending: false }),
        supabase.from('passages').select('id', { count: 'exact', head: true }).eq('is_public', true),
    ]);

    const profile = profileRes.data as unknown as DbProfile | null;
    if (!profile) redirect('/');

    return (
        <MyPageClient
            profile={profile}
            purchases={(purchasesRes.data ?? []) as unknown as []}
            publicPassageCount={publicPassagesCountRes.count ?? 0}
            userId={user!.id}
        />
    );
}

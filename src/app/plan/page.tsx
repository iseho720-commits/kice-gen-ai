import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TopicPlanClient from './TopicPlanClient';

interface Props {
    searchParams: Promise<{ keyword?: string }>;
}

export default async function PlanPage({ searchParams }: Props) {
    const { keyword } = await searchParams;
    if (!keyword) redirect('/');

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect(`/?error=not_logged_in&keyword=${encodeURIComponent(keyword)}`);

    return <TopicPlanClient keyword={keyword} />;
}

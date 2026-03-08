import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PassageClient from './PassageClient';
import { DbPassage, DbProfile } from '@/types/database';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function PassagePage({ params }: Props) {
    const { id } = await params;
    const supabase = await createClient();

    if (id === 'mock-passage-id') {
        const mockPassage = {
            id: 'mock-passage-id',
            keyword: '테스트 지문',
            title: '인공지능과 비문학 독해의 상관관계',
            category: '기술',
            content: '1문단: 비문학 독해는 글의 정보를 정확하게 파악하고 논리적 구조를 이해하는 과정이다.\n\n2문단: 인공지능 기술의 발전으로 인간의 독해 과정을 모델링하려는 시도가 늘고 있다. 변수 A인 데이터량과 독해력의 상관관계는...\n\n3문단: 하지만 단순히 데이터의 양만이 중요한 것은 아니다. 이와 대립하는 변수 B로서 논리적 추론 능력이 등장하는데...\n\n4문단: A와 B는 상호 보완적인 관계에 있다. 데이터가 많을수록 추론의 정확도가 높아지지만, 추론 로직이 없으면 데이터는 단순 나열에 불과하다(마의 구간).\n\n5문단: 따라서 인공지능 기반 독해 교육은 단순 지식 습득이 아닌 리터러시 함양에 그 의의가 있다.',
            logic_structure: '1문단: 화제 도입\n2문단: 데이터량(A)\n3문단: 추론 능력(B)\n4문단: 복합 관계\n5문단: 결론',
            is_public: true,
            usage_count: 0,
            created_at: new Date().toISOString()
        };
        return (
            <PassageClient
                passage={mockPassage as any}
                profile={{ id: 'mock-user-id', email: 'test@kice-gen.ai', credits: 3, is_early_bird: true } as any}
                hasPurchased={false}
                userId="mock-user-id"
            />
        );
    }

    const { data: passageRaw } = await supabase
        .from('passages')
        .select('*')
        .eq('id', id)
        .single();

    if (!passageRaw) return notFound();
    const passage = passageRaw as unknown as DbPassage;

    const { data: { user } } = await supabase.auth.getUser();
    let profile: DbProfile | null = null;
    let hasPurchased = false;

    if (user) {
        const [profileRes, purchaseRes] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', user.id).single(),
            supabase.from('purchases').select('id').eq('user_id', user.id).eq('passage_id', id).maybeSingle(),
        ]);
        profile = profileRes.data as unknown as DbProfile | null;
        hasPurchased = !!purchaseRes.data;
    }

    return (
        <PassageClient
            passage={passage}
            profile={profile}
            hasPurchased={hasPurchased}
            userId={user?.id ?? null}
        />
    );
}

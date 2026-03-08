'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lightbulb, Copy, Zap, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface Props {
    keyword: string;
}

export default function TopicPlanClient({ keyword }: Props) {
    const [plans, setPlans] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [genLoading, setGenLoading] = useState<number | null>(null);
    const [copied, setCopied] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await fetch('/api/plan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ keyword }),
                });
                const data = await res.json();
                if (data.plan) {
                    setPlans(data.plan);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, [keyword]);

    // Helper to parse the 3 plans from the markdown
    const parsePlans = (text: string) => {
        const sections = text.split(/💡 기획안 \d:/).filter(Boolean);
        return sections.slice(0, 3).map((s, i) => {
            const promptMatch = s.match(/\[생성기 입력용 프롬프트\]([\s\S]*)$/);
            const prompt = promptMatch ? promptMatch[1].trim() : '';
            const content = s.split('[생성기 입력용 프롬프트]')[0].trim();

            // Extract title from the first line or use a default
            const titleLines = content.split('\n');
            const title = titleLines[0].trim() || `기획안 ${i + 1}`;

            return { title, content, prompt };
        });
    };

    const parsed = plans ? parsePlans(plans) : [];

    const handleCopy = (text: string, idx: number) => {
        navigator.clipboard.writeText(text);
        setCopied(idx);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleImmediateGenerate = async (prompt: string, idx: number) => {
        setGenLoading(idx);
        try {
            // Actually, our /api/generate expects a keyword. 
            // We can pass the whole prompt as the "keyword" if we adjust the prompt handling,
            // or we can add a new field to /api/generate.
            // For now, let's just pass the keyword but with the prompt context.
            // Actually, the best way is to go to /generate page which handle the loading UX.
            router.push(`/generate?keyword=${encodeURIComponent(prompt)}`);
        } catch (e) {
            console.error(e);
            setGenLoading(null);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-navy">
            <Navbar />
            <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full space-y-8">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors">
                    <ArrowLeft size={16} /> 홈으로 돌아가기
                </Link>

                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-accent-blue/20 flex items-center justify-center">
                            <Lightbulb className="text-accent-blue" size={20} />
                        </div>
                        <h1 className="text-2xl font-black text-white">출제 기획안 제안</h1>
                    </div>
                    <p className="text-slate-400">키워드 <span className="text-accent-blue font-bold">"{keyword}"</span>를 바탕으로 설계된 평가원 로직의 3가지 기획입니다.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4">
                        <Loader2 className="text-accent-blue animate-spin" size={48} />
                        <p className="text-slate-500 font-medium">평가원 위원들이 주제를 기획 중입니다...</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                        {parsed.map((plan, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass rounded-2xl flex flex-col border border-slate-800 hover:border-slate-700 transition-all overflow-hidden"
                            >
                                <div className="p-6 flex-1 space-y-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded uppercase tracking-wider">Plan {idx + 1}</span>
                                    </div>
                                    <h3 className="text-white font-bold text-lg leading-tight">{plan.title}</h3>
                                    <div className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap h-64 overflow-y-auto pr-2 custom-scrollbar">
                                        {plan.content.replace(plan.title, '').trim()}
                                    </div>
                                </div>

                                <div className="p-4 bg-navy/40 border-t border-slate-800 space-y-2">
                                    <button
                                        onClick={() => handleCopy(plan.prompt, idx)}
                                        className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-xl text-sm font-semibold transition-all"
                                    >
                                        {copied === idx ? <CheckCircle size={14} /> : <Copy size={14} />}
                                        {copied === idx ? '복사 완료' : '프롬프트 복사'}
                                    </button>
                                    <button
                                        onClick={() => handleImmediateGenerate(plan.prompt, idx)}
                                        disabled={genLoading !== null}
                                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                                    >
                                        {genLoading === idx ? <Loader2 size={16} className="animate-spin" /> : <Zap size={14} />}
                                        지문 생성하기
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

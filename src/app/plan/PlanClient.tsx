'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lightbulb, Zap, ChevronRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface Plan {
    id: number;
    title: string;
    category: string;
    point: string;
    killer_logic: string;
    prompt: string;
}

export default function PlanClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const keyword = searchParams.get('keyword') ?? '';

    const [loading, setLoading] = useState(true);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!keyword) {
            router.push('/');
            return;
        }

        const fetchPlans = async () => {
            try {
                const res = await fetch('/api/plan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ keyword }),
                });
                const data = await res.json();
                if (data.error) throw new Error(data.error);
                setPlans(data.plans);
            } catch (err: any) {
                setError(err.message || '기획안을 불러오는 데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, [keyword, router]);

    const handleSelectPlan = (plan: Plan) => {
        const params = new URLSearchParams();
        params.set('keyword', keyword);
        params.set('plan', plan.prompt);
        router.push(`/generate?${params.toString()}`);
    };

    return (
        <div className="min-h-screen flex flex-col bg-navy selection:bg-accent-blue/30">
            <Navbar />

            <main className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full space-y-10">
                {/* Header */}
                <div className="space-y-4">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors text-sm"
                    >
                        <ArrowLeft size={16} /> 다시 키워드 입력하기
                    </button>
                    <div className="flex items-end gap-3">
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                            지문 출제 <span className="text-accent-blue">기회안</span>
                        </h1>
                        <p className="text-slate-500 text-lg font-medium pb-1.5 hidden md:block">
                            키워드: <span className="text-slate-300">"{keyword}"</span>
                        </p>
                    </div>
                    <p className="text-slate-400 max-w-2xl leading-relaxed">
                        평가원 수석 출제위원이 기획한 3가지 논리 구조 중 하나를 선택하세요.
                        각 기획안은 서로 다른 변수와 대립항을 바탕으로 고난도 추론 지문을 구성합니다.
                    </p>
                </div>

                {/* Content */}
                <div className="relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center space-y-6"
                            >
                                <div className="relative">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                        className="w-16 h-16 rounded-full border-t-2 border-r-2 border-accent-blue"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Sparkles size={24} className="text-accent-blue animate-pulse" />
                                    </div>
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-xl font-bold text-white">논리 흐름 기획 중...</p>
                                    <p className="text-slate-500 text-sm">기출 DNA를 바탕으로 최적의 대립항을 설계하고 있습니다.</p>
                                </div>
                            </motion.div>
                        ) : error ? (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass rounded-3xl p-10 text-center space-y-6 border-red-500/20"
                            >
                                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto">
                                    <AlertCircle size={32} className="text-red-400" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-xl font-bold text-white">기획안 생성 실패</h2>
                                    <p className="text-slate-400">{error}</p>
                                </div>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-700 transition-all border border-slate-700"
                                >
                                    새로고침
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="plans"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid md:grid-cols-3 gap-6"
                            >
                                {plans.map((plan, idx) => (
                                    <motion.div
                                        key={plan.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        whileHover={{ y: -8 }}
                                        className="group relative flex flex-col h-full bg-slate-900/50 rounded-3xl border border-slate-800 hover:border-accent-blue/50 p-6 md:p-8 transition-all duration-300 cursor-pointer overflow-hidden overflow-hidden"
                                        onClick={() => handleSelectPlan(plan)}
                                    >
                                        {/* Hover Glow */}
                                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-blue/5 blur-[80px] group-hover:bg-accent-blue/15 transition-all duration-500 rounded-full" />

                                        <div className="flex-1 space-y-5 relative">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-black uppercase tracking-widest text-accent-blue bg-accent-blue/10 px-2.5 py-1 rounded-md border border-accent-blue/20">
                                                    Option {plan.id}
                                                </span>
                                                <span className="text-xs text-slate-500 font-medium">#{plan.category}</span>
                                            </div>

                                            <div className="space-y-2">
                                                <h3 className="text-xl font-black text-white leading-tight group-hover:text-accent-blue transition-colors">
                                                    {plan.title.replace(/\[|\]/g, '')}
                                                </h3>
                                            </div>

                                            <div className="space-y-4 pt-2">
                                                <div className="space-y-1.5">
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">출제 포인트</p>
                                                    <p className="text-xs text-slate-300 leading-relaxed font-medium">{plan.point}</p>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <p className="text-[10px] font-bold text-accent-blue uppercase tracking-tighter">마의 구간 (Killer Logic)</p>
                                                    <p className="text-xs text-slate-400 italic bg-blue-500/5 p-2.5 rounded-xl border border-blue-500/10">{plan.killer_logic}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8">
                                            <div className="w-full flex items-center justify-center gap-2 bg-slate-800 group-hover:bg-accent-blue text-white group-hover:text-navy font-black py-3 rounded-2xl transition-all duration-300">
                                                선택 후 지문 생성 <ChevronRight size={18} />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <footer className="py-10 text-center border-t border-slate-900">
                <p className="text-xs text-slate-600 font-medium tracking-wide items-center gap-2 flex justify-center">
                    <Lightbulb size={12} className="text-slate-500" /> 모든 기획안은 2026학년도 수능 출제 기조를 따릅니다
                </p>
            </footer>
        </div>
    );
}

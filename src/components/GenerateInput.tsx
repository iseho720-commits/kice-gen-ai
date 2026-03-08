'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, Search } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const PLACEHOLDERS = [
    '아이돌 그룹의 수요 곡선과 팬덤 경제학...',
    '딥러닝의 역전파 알고리즘 원리...',
    '기후 협약과 탄소 배출권 시장의 역학...',
    'K-팝 콘텐츠 산업의 글로벌 확장 전략...',
    '게임 내 아이템 밸런싱과 마의 구간...',
];

interface GenerateInputProps {
    value: string;
    onChange: (v: string) => void;
}

export default function GenerateInput({ value, onChange }: GenerateInputProps) {
    const [placeholderIdx, setPlaceholderIdx] = useState(0);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { user, setShowAuthModal } = useAuthStore();

    useEffect(() => {
        const t = setInterval(() => {
            setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length);
        }, 3500);
        return () => clearInterval(t);
    }, []);

    const handleGenerate = async (mode: 'direct' | 'plan') => {
        if (!value.trim()) return;
        if (!user) {
            setShowAuthModal(true, 'signup');
            return;
        }

        if (mode === 'plan') {
            router.push(`/plan?keyword=${encodeURIComponent(value.trim())}`);
            return;
        }

        // Route to the new integrated pipeline instead of calling the API directly
        router.push(`/generate?keyword=${encodeURIComponent(value.trim())}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="w-full max-w-3xl mx-auto"
        >
            <div className="search-input gradient-border rounded-2xl p-1 transition-all duration-300">
                <div className="flex items-center gap-3 bg-slate-card rounded-xl px-4 py-3">
                    <Search className="text-accent-blue shrink-0" size={22} />
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate('direct')}
                        placeholder={PLACEHOLDERS[placeholderIdx]}
                        className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 text-base focus:outline-none transition-all"
                    />
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => handleGenerate('plan')}
                            disabled={loading || !value.trim()}
                            className="shrink-0 flex items-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold px-4 py-2.5 rounded-xl transition-all text-sm border border-slate-700"
                        >
                            {loading ? '기획 중...' : '주제 고도화(기획)'}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => handleGenerate('direct')}
                            disabled={loading || !value.trim()}
                            className="shrink-0 flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-40 text-white font-bold px-5 py-2.5 rounded-xl transition-all text-sm"
                        >
                            <Zap size={16} className="shrink-0" />
                            {loading ? '생성 중...' : '즉시 생성'}
                        </motion.button>
                    </div>
                </div>
            </div>

            <p className="text-center text-xs text-slate-500 mt-3">
                관심사를 입력하면 평가원 형식의 5문단 비문학 지문이 생성됩니다
            </p>
        </motion.div>
    );
}

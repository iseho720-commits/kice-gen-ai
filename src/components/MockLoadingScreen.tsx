'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const LOADING_STAGES = [
    { text: '키워드 분석 중...', subtext: '의미론적 벡터 공간에서 주제 좌표를 탐색합니다' },
    { text: '평가원 로직 설계 중...', subtext: '5문단 출제 프레임워크를 적용합니다' },
    { text: '변수 A 원리 도출 중...', subtext: '핵심 개념의 인과 메커니즘을 설계합니다' },
    { text: '대립항 변수 직조 중...', subtext: '변수 B와 상관관계를 계산합니다' },
    { text: '마의 구간 설정 중...', subtext: '비례·반비례 논리 구조를 최적화합니다' },
    { text: '학술적 평서문 완성 중...', subtext: '평가원 문체로 최종 교정합니다' },
];

interface MockLoadingScreenProps {
    keyword: string;
    prompt?: string;
    onComplete: (passageId: string) => void;
    onError: (msg: string) => void;
}

export default function MockLoadingScreen({ keyword, prompt, onComplete, onError }: MockLoadingScreenProps) {
    const [stageIdx, setStageIdx] = useState(0);
    const [progress, setProgress] = useState(0);
    const [apiDone, setApiDone] = useState<string | null>(null);
    const MIN_DURATION_MS = 45000; // 45 seconds mandatory wait

    // Call the API immediately
    useEffect(() => {
        const startTime = Date.now();
        fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keyword: prompt || keyword }),
        })
            .then((r) => r.json())
            .then((data) => {
                if (data.error) {
                    onError(data.error);
                    return;
                }
                const elapsed = Date.now() - startTime;
                const remaining = MIN_DURATION_MS - elapsed;
                // Wait at least until 45 seconds have passed
                setTimeout(() => {
                    setApiDone(data.passage_id);
                }, Math.max(0, remaining));
            })
            .catch(() => onError('네트워크 오류가 발생했습니다.'));
    }, [keyword, onComplete, onError]);

    // Navigate when both conditions met
    useEffect(() => {
        if (apiDone && progress >= 100) {
            onComplete(apiDone);
        }
    }, [apiDone, progress, onComplete]);

    // Advance stages over 45 seconds
    useEffect(() => {
        const totalStages = LOADING_STAGES.length;
        const interval = setInterval(() => {
            setStageIdx((prev) => (prev < totalStages - 1 ? prev + 1 : prev));
        }, MIN_DURATION_MS / totalStages);
        return () => clearInterval(interval);
    }, []);

    // Update progress bar over 45 seconds
    useEffect(() => {
        const step = 100 / (MIN_DURATION_MS / 200);
        const interval = setInterval(() => {
            setProgress((prev) => {
                const next = Math.min(99, prev + step); // never reach 100 until truly done
                return next;
            });
        }, 200);
        return () => clearInterval(interval);
    }, []);

    // Allow 100 only after API is done
    useEffect(() => {
        if (apiDone) {
            setProgress(100);
        }
    }, [apiDone]);

    const stage = LOADING_STAGES[stageIdx];

    return (
        <div className="fixed inset-0 z-50 bg-navy flex flex-col items-center justify-center p-8">
            {/* Animated background blobs */}
            <motion.div
                className="absolute w-96 h-96 rounded-full bg-sky-500/8 blur-3xl"
                animate={{ scale: [1, 1.2, 1], x: [-50, 50, -50] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="absolute w-72 h-72 rounded-full bg-violet-500/8 blur-3xl"
                animate={{ scale: [1.2, 1, 1.2], x: [50, -50, 50] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="relative z-10 w-full max-w-lg text-center space-y-8">
                {/* Orbital spinner */}
                <div className="relative w-24 h-24 mx-auto">
                    <motion.div
                        className="absolute inset-0 rounded-full border-2 border-accent-blue/30"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                    <motion.div
                        className="absolute inset-2 rounded-full border-2 border-t-accent-blue border-r-transparent border-b-transparent border-l-transparent"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                    <motion.div
                        className="absolute inset-4 rounded-full border-2 border-t-transparent border-r-accent-green border-b-transparent border-l-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-accent-blue font-black text-sm">AI</span>
                    </div>
                </div>

                {/* Stage text */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={stageIdx}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-2"
                    >
                        <h2 className="text-2xl font-black text-white">{stage.text}</h2>
                        <p className="text-slate-400 text-sm">{stage.subtext}</p>
                    </motion.div>
                </AnimatePresence>

                {/* Progress bar */}
                <div className="space-y-2">
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-sky-500 via-blue-500 to-violet-500"
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                        />
                    </div>
                    <p className="text-xs text-slate-600">
                        {Math.round(progress)}% 완료
                    </p>
                </div>

                {/* Keyword chip */}
                <div className="glass inline-block px-4 py-2 rounded-full text-sm text-accent-blue border border-accent-blue/20">
                    키워드: {keyword}
                </div>

                {/* Steps list */}
                <div className="space-y-2 text-left">
                    {LOADING_STAGES.map((s, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full shrink-0 transition-colors duration-300 ${i < stageIdx
                                ? 'bg-accent-green'
                                : i === stageIdx
                                    ? 'bg-accent-blue animate-pulse'
                                    : 'bg-slate-700'
                                }`} />
                            <span className={`text-xs transition-colors duration-300 ${i <= stageIdx ? 'text-slate-300' : 'text-slate-700'
                                }`}>{s.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

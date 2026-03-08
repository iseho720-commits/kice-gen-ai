'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DbPassage } from '@/types/database';

const LOADING_STAGES = [
    { text: '주제 분석 및 평가원식 출제 기획안 작성 중...', subtext: '의미론적 벡터 공간에서 주제 좌표를 탐색합니다' },
    { text: '마의 구간(비례/반비례) 논리 직조 및 지문 작성 중...', subtext: '5문단 출제 프레임워크를 적용합니다' },
    { text: 'KICE 표준 PDF 레이아웃 렌더링 중...', subtext: '평가원 문체로 최종 교정 및 PDF 변환을 준비합니다' },
];

interface ProcessingViewProps {
    keyword: string;
    onComplete: (passage: DbPassage) => void;
    onError: (msg: string) => void;
}

export default function ProcessingView({ keyword, onComplete, onError }: ProcessingViewProps) {
    const [stageIdx, setStageIdx] = useState(0);
    const [progress, setProgress] = useState(0);
    const [apiResult, setApiResult] = useState<DbPassage | null>(null);
    const [timerDone, setTimerDone] = useState(false);
    const MIN_DURATION_MS = 45000;

    const apiCalledRef = useRef(false);

    // Call the API immediately
    useEffect(() => {
        if (apiCalledRef.current) return;
        apiCalledRef.current = true;

        fetch('/api/generate/pipeline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keyword }),
        })
            .then((r) => r.json())
            .then((data) => {
                if (data.error) {
                    onError(data.error);
                } else if (data.passage) {
                    setApiResult(data.passage);
                }
            })
            .catch(() => onError('네트워크 오류가 발생했습니다.'));
    }, [keyword, onError]);

    // Timer logic
    useEffect(() => {
        const timeout = setTimeout(() => {
            setTimerDone(true);
        }, MIN_DURATION_MS);

        return () => clearTimeout(timeout);
    }, []);

    // Navigate when both conditions met
    useEffect(() => {
        if (apiResult && timerDone) {
            // Use setTimeout to avoid calling setState synchronously in effect
            const t = setTimeout(() => {
                setProgress(100);
                onComplete(apiResult);
            }, 500);
            return () => clearTimeout(t);
        }
    }, [apiResult, timerDone, onComplete]);

    // Advance stages over 45 seconds (0s, 15s, 35s)
    useEffect(() => {
        const stage1 = setTimeout(() => setStageIdx(1), 15000);
        const stage2 = setTimeout(() => setStageIdx(2), 35000);
        return () => {
            clearTimeout(stage1);
            clearTimeout(stage2);
        };
    }, []);

    // Update progress bar
    useEffect(() => {
        // Increment progress from 0 to 99 over 45 seconds
        // 45000ms / 200ms = 225 steps
        const stepAmt = 100 / 225;
        const interval = setInterval(() => {
            setProgress((prev) => {
                const next = Math.min(99, prev + stepAmt);
                return next;
            });
        }, 200);
        return () => clearInterval(interval);
    }, []);

    const stage = LOADING_STAGES[stageIdx] || LOADING_STAGES[0];

    return (
        <div className="fixed inset-0 z-50 bg-navy flex flex-col items-center justify-center p-8">
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

                <AnimatePresence mode="wait">
                    <motion.div
                        key={stageIdx}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-2 h-16"
                    >
                        <h2 className="text-xl md:text-2xl font-black text-white">{stage.text}</h2>
                        <p className="text-slate-400 text-sm">{stage.subtext}</p>
                    </motion.div>
                </AnimatePresence>

                <div className="space-y-2 mt-4">
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

                <div className="glass inline-block px-4 py-2 rounded-full text-sm text-accent-blue border border-accent-blue/20">
                    키워드: {keyword}
                </div>

                <div className="space-y-3 pt-6 text-left">
                    {LOADING_STAGES.map((s, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full shrink-0 transition-colors duration-300 ${i < stageIdx
                                ? 'bg-accent-green'
                                : i === stageIdx
                                    ? 'bg-accent-blue animate-pulse'
                                    : 'bg-slate-700'
                                }`} />
                            <span className={`text-sm transition-colors duration-300 ${i <= stageIdx ? 'text-slate-300' : 'text-slate-700'
                                }`}>{s.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div >
    );
}

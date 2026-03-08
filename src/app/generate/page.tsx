'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Unlock, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

import ProcessingView from '@/components/ProcessingView';
import PdfResultView from '@/components/PdfResultView';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/client';
import { DbPassage, DbProfile } from '@/types/database';

// Create supabase client at module scope to avoid stale closures
const supabase = createClient();

type Step = 'IDLE' | 'PROCESSING' | 'PREVIEW' | 'COMPLETE';

// PortOne V2 SDK — loaded dynamically
declare global {
    interface Window {
        PortOne?: {
            requestPayment: (params: Record<string, unknown>) => Promise<{ paymentId: string; code?: string; message?: string }>;
        };
    }
}

function getPriceForProfile(profile: DbProfile | null): number {
    if (!profile) return 1000;
    if (profile.credits > 0) return 0;
    const now = new Date();
    const csatDay = new Date('2026-11-12T23:59:59+09:00');
    if (profile.is_early_bird && now <= csatDay) return 500;
    return 1000;
}

function splitParagraphs(content: string): string[] {
    return content.split(/\n\n+/).filter(Boolean);
}

function GeneratePageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const keyword = searchParams.get('keyword') ?? '';

    // Pipeline States
    const [step, setStep] = useState<Step>('IDLE');
    const [passage, setPassage] = useState<DbPassage | null>(null);
    const [error, setError] = useState('');

    // Auth & Profile
    const [userId, setUserId] = useState<string | null>(null);
    const [profile, setProfile] = useState<DbProfile | null>(null);
    const [paymentLoading, setPaymentLoading] = useState(false);

    useEffect(() => {
        // IDLE -> PROCESSING if keyword exists
        if (keyword && step === 'IDLE') {
            setStep('PROCESSING');
        } else if (!keyword && step !== 'IDLE') {
            router.push('/');
        }
    }, [keyword, step, router]);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (data) setProfile(data as DbProfile);
            }
        };
        fetchUser();
    }, []);

    const handleProcessingComplete = (generatedPassage: DbPassage) => {
        setPassage(generatedPassage);
        setStep('PREVIEW');
    };

    const handleError = (msg: string) => {
        if (msg === 'CREDIT_EXHAUSTED') {
            router.push('/?error=no_credits');
        } else {
            setError(msg);
        }
    };

    const recordPurchase = async (passageId: string, amount: number) => {
        if (!userId) return;
        await supabase.from('purchases').insert({
            user_id: userId,
            passage_id: passageId,
            amount,
            type: 'single',
        });
    };

    const handlePurchase = async () => {
        if (!userId) {
            alert('로그인이 필요합니다.');
            return;
        }
        if (!passage) return;

        const price = getPriceForProfile(profile);

        if (price === 0) {
            // Free via credits
            await recordPurchase(passage.id, 0);
            setStep('COMPLETE');
            return;
        }

        setPaymentLoading(true);
        try {
            // Load PortOne SDK
            if (!window.PortOne) {
                await new Promise<void>((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.portone.io/v2/browser-sdk.js';
                    script.onload = () => resolve();
                    script.onerror = () => reject(new Error('PortOne SDK 로드 실패'));
                    document.head.appendChild(script);
                });
            }

            const paymentId = `kice-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const response = await window.PortOne!.requestPayment({
                storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID,
                paymentId,
                orderName: `KICE-Gen AI 지문: ${passage.title}`,
                totalAmount: price,
                currency: 'KRW',
                channelKey: 'portone_default',
                customer: { email: profile?.email ?? '' },
            });

            if (response.code) {
                alert(`결제 실패: ${response.message}`);
                return;
            }

            // Verify via backend
            const verifyRes = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId, passageId: passage.id, amount: price }),
            });
            const data = await verifyRes.json();
            if (data.ok) {
                setStep('COMPLETE');
            } else {
                alert(`결제 검증 실패: ${data.error}`);
            }
        } catch (err) {
            console.error(err);
            alert('결제 중 오류가 발생했습니다.');
        } finally {
            setPaymentLoading(false);
        }
    };

    // Rendering based on STEP
    if (error) {
        return (
            <div className="min-h-screen bg-navy flex items-center justify-center p-8">
                <div className="glass rounded-2xl p-8 max-w-md text-center space-y-4">
                    <p className="text-red-400 text-xl font-bold">⚠️ 오류 발생</p>
                    <p className="text-slate-300">{error}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-accent-blue text-navy font-bold px-6 py-2 rounded-xl"
                    >
                        홈으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    if (step === 'IDLE') return null;

    if (step === 'PROCESSING') {
        return <ProcessingView keyword={keyword} onComplete={handleProcessingComplete} onError={handleError} />;
    }

    if (step === 'COMPLETE' && passage) {
        return (
            <>
                <Navbar />
                <PdfResultView passage={passage} />
            </>
        );
    }

    // PREVIEW
    if (step === 'PREVIEW' && passage) {
        const paragraphs = splitParagraphs(passage.content);
        const price = getPriceForProfile(profile);

        return (
            <div className="min-h-screen flex flex-col bg-navy">
                <Navbar />
                <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
                        <ArrowLeft size={16} /> 홈으로
                    </Link>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-accent-blue/10 text-accent-blue border border-accent-blue/20 mb-4 inline-block">
                            {passage.category}
                        </span>
                        <h1 className="text-3xl font-black text-white mb-2 leading-tight">{passage.title}</h1>
                        <p className="text-slate-500 text-sm mb-8">키워드: {passage.keyword}</p>
                    </motion.div>

                    <div className="glass rounded-2xl p-6 md:p-10 space-y-6 relative">
                        {paragraphs.map((para, idx) => {
                            const isBlurred = idx > 0;
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.08 }}
                                    className="relative"
                                >
                                    <span className="text-xs font-bold text-slate-600 block mb-1">{idx + 1}문단</span>
                                    <p className={`font-myeongjo text-[1.05rem] leading-[2] text-slate-200 text-justify transition-all duration-500 select-none ${isBlurred ? 'paywall-blur' : ''}`}>
                                        {para}
                                    </p>
                                    {isBlurred && (
                                        <div className="watermark-overlay">
                                            <span className="watermark-text">KICE-GEN PREVIEW</span>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-card via-slate-card/80 to-transparent rounded-b-2xl pointer-events-none" />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 glass rounded-2xl p-8 text-center space-y-4 border border-slate-700 relative z-20"
                    >
                        <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto">
                            <Lock size={24} className="text-accent-blue" />
                        </div>
                        <h2 className="text-xl font-black text-white">2-5문단이 잠겨 있습니다</h2>
                        <p className="text-slate-400 text-sm">
                            {price === 0
                                ? '무료 크레딧으로 열 수 있습니다'
                                : profile?.is_early_bird
                                    ? '초창기 가입자 혜택 적용 — 500원으로 전체 지문 열람'
                                    : '1,000원으로 전체 지문 + 고해상도 PDF 다운로드'}
                        </p>

                        <div className="flex items-center justify-center gap-3">
                            {price > 0 && (
                                <span className="text-3xl font-black text-white">
                                    {price.toLocaleString()}원
                                </span>
                            )}
                            {price === 0 && (
                                <span className="text-2xl font-black text-accent-green">무료 (크레딧 사용)</span>
                            )}
                            {price === 500 && (
                                <span className="text-slate-500 text-sm line-through">1,000원</span>
                            )}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handlePurchase}
                            disabled={paymentLoading || !userId}
                            className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 text-white font-black py-3.5 rounded-xl transition-all"
                        >
                            {paymentLoading ? (
                                <><Loader2 size={18} className="animate-spin" /> 결제/저장 처리 중...</>
                            ) : (
                                <><Unlock size={18} /> {price === 0 ? '단일 지문 생성 (크레딧 1개 소모)' : '전체 열람 및 PDF 다운로드'}</>
                            )}
                        </motion.button>

                        {!userId && (
                            <p className="text-xs text-slate-600 mt-2">로그인 후 생성할 수 있습니다</p>
                        )}
                    </motion.div>
                </main>
            </div>
        );
    }

    return null;
}

export default function GeneratePage() {
    return (
        <Suspense>
            <GeneratePageInner />
        </Suspense>
    );
}

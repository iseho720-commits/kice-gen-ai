'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Download, BookOpen, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { DbPassage, DbProfile } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';

// PortOne V2 SDK — loaded dynamically
declare global {
    interface Window {
        PortOne?: {
            requestPayment: (params: Record<string, unknown>) => Promise<{ paymentId: string; code?: string; message?: string }>;
        };
    }
}

interface Props {
    passage: DbPassage;
    profile: DbProfile | null;
    hasPurchased: boolean;
    userId: string | null;
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

export default function PassageClient({ passage, profile, hasPurchased: initialPurchased, userId }: Props) {
    const [unlocked, setUnlocked] = useState(initialPurchased || getPriceForProfile(profile) === 0);
    const [loading, setLoading] = useState(false);
    const [showPDF, setShowPDF] = useState(false);
    const supabase = createClient();

    const price = getPriceForProfile(profile);
    const paragraphs = splitParagraphs(passage.content);

    const handlePurchase = async () => {
        if (!userId) {
            alert('로그인이 필요합니다.');
            return;
        }
        if (price === 0) {
            // Free via credits — just mark as purchased
            await recordPurchase(0, 'single');
            setUnlocked(true);
            return;
        }

        setLoading(true);
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
                setUnlocked(true);
            } else {
                alert(`결제 검증 실패: ${data.error}`);
            }
        } catch (err) {
            console.error(err);
            alert('결제 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const recordPurchase = async (amount: number, type: 'single' | 'bundle' | 'weekly_pass') => {
        await supabase.from('purchases').insert({
            user_id: userId!,
            passage_id: passage.id,
            amount,
            type,
        });
    };

    const handleDownloadPDF = () => {
        setShowPDF(true);
    };

    return (
        <div className="min-h-screen flex flex-col bg-navy">
            <Navbar />

            <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">
                {/* Back */}
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
                    <ArrowLeft size={16} /> 홈으로
                </Link>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-accent-blue/10 text-accent-blue border border-accent-blue/20 mb-4 inline-block">
                        {passage.category}
                    </span>
                    <h1 className="text-3xl font-black text-white mb-2 leading-tight">{passage.title}</h1>
                    <p className="text-slate-500 text-sm mb-8">키워드: {passage.keyword}</p>
                </motion.div>

                {/* Passages */}
                <div className="glass rounded-2xl p-6 md:p-10 space-y-6 relative">
                    {paragraphs.map((para, idx) => {
                        const isBlurred = !unlocked && idx > 0;

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08 }}
                                className="relative"
                            >
                                {/* Paragraph Number */}
                                <span className="text-xs font-bold text-slate-600 block mb-1">{idx + 1}문단</span>

                                {/* Paragraph text */}
                                <p className={`font-myeongjo text-[1.05rem] leading-[2] text-slate-200 text-justify transition-all duration-500 select-none ${isBlurred ? 'paywall-blur' : ''
                                    }`}>
                                    {para}
                                </p>

                                {/* Watermark over blurred paragraphs */}
                                {isBlurred && (
                                    <div className="watermark-overlay">
                                        <span className="watermark-text">KICE-GEN SAMPLE</span>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}

                    {/* Gradient fade at bottom when locked */}
                    {!unlocked && (
                        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-card via-slate-card/80 to-transparent rounded-b-2xl pointer-events-none" />
                    )}
                </div>

                {/* Paywall CTA */}
                <AnimatePresence>
                    {!unlocked && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mt-8 glass rounded-2xl p-8 text-center space-y-4 border border-slate-700"
                        >
                            <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto">
                                <Lock size={24} className="text-accent-blue" />
                            </div>
                            <h2 className="text-xl font-black text-white">
                                2-5문단이 잠겨 있습니다
                            </h2>
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
                                disabled={loading || !userId}
                                className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 text-white font-black py-3.5 rounded-xl transition-all"
                            >
                                {loading ? (
                                    <><Loader2 size={18} className="animate-spin" /> 결제 처리 중...</>
                                ) : (
                                    <><Unlock size={18} /> {price === 0 ? '전체 열람 (크레딧 사용)' : '전체 열람하기'}</>
                                )}
                            </motion.button>

                            {!userId && (
                                <p className="text-xs text-slate-600">로그인 후 구매하실 수 있습니다</p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Post-unlock: Download PDF */}
                <AnimatePresence>
                    {unlocked && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-8 glass rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 border border-accent-green/20"
                        >
                            <div className="w-12 h-12 rounded-full bg-accent-green/10 flex items-center justify-center shrink-0">
                                <BookOpen size={22} className="text-accent-green" />
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <h3 className="text-white font-bold text-lg">지문 전체 열람 완료!</h3>
                                <p className="text-slate-400 text-sm">고해상도 수능지 PDF로 다운로드하여 인쇄해 풀어보세요</p>
                            </div>
                            <Link
                                href={`/passage/${passage.id}/pdf`}
                                target="_blank"
                                className="flex items-center gap-2 bg-accent-green/10 hover:bg-accent-green/20 border border-accent-green/30 text-accent-green font-bold px-5 py-2.5 rounded-xl transition-all shrink-0"
                            >
                                <Download size={16} /> PDF 다운로드
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Logic Structure (if available) */}
                {passage.logic_structure && unlocked && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8 glass rounded-2xl p-6"
                    >
                        <h3 className="text-white font-bold mb-4 text-sm flex items-center gap-2">
                            <BookOpen size={16} className="text-accent-blue" />
                            출제 논리 구조
                        </h3>
                        <div className="space-y-2">
                            {passage.logic_structure.split('\n').map((line, i) => (
                                <p key={i} className="text-slate-400 text-sm font-myeongjo">{line}</p>
                            ))}
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}

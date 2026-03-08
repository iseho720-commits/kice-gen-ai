'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Coins, Star, BookOpen, Package, RefreshCw, Calendar, Loader2, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { DbProfile } from '@/types/database';
import { getDDayCount } from '@/lib/utils';

interface Purchase {
    id: string;
    amount: number;
    type: string;
    created_at: string;
    passages?: { id: string; title: string; keyword: string; category: string; created_at: string } | null;
}

interface Props {
    profile: DbProfile;
    purchases: Purchase[];
    publicPassageCount: number;
    userId: string;
}

export default function MyPageClient({ profile, purchases, publicPassageCount, userId }: Props) {
    const [bundleLoading, setBundleLoading] = useState(false);
    const [bundleSuccess, setBundleSuccess] = useState(false);
    const [passLoading, setPassLoading] = useState(false);
    const [passSuccess, setPassSuccess] = useState(false);
    const dDay = getDDayCount();

    const BUNDLE_PRICE = 5000;
    const PASS_PRICE = 9900;

    const handleBundlePurchase = async () => {
        setBundleLoading(true);
        try {
            const res = await fetch('/api/purchase-bundle', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
            const data = await res.json();
            if (data.ok) {
                setBundleSuccess(true);
                window.open(data.pdf_url, '_blank');
            } else {
                alert(data.error ?? '오류가 발생했습니다.');
            }
        } catch {
            alert('네트워크 오류');
        } finally {
            setBundleLoading(false);
        }
    };

    const handlePassPurchase = async () => {
        setPassLoading(true);
        try {
            const res = await fetch('/api/purchase-pass', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
            const data = await res.json();
            if (data.ok) {
                setPassSuccess(true);
            } else {
                alert(data.error ?? '오류가 발생했습니다.');
            }
        } catch {
            alert('네트워크 오류');
        } finally {
            setPassLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-navy">
            <Navbar />
            <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full space-y-8">
                {/* Back */}
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors">
                    <ArrowLeft size={16} /> 홈
                </Link>

                {/* Profile Overview */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shrink-0">
                            <BookOpen size={24} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-black text-white truncate">{profile.email}</h1>
                            <div className="flex flex-wrap gap-3 mt-2">
                                <span className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-amber-400 text-sm font-semibold">
                                    <Coins size={14} /> {profile.credits}크레딧 보유
                                </span>
                                {profile.is_early_bird && (
                                    <span className="flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full text-sky-400 text-sm font-semibold">
                                        <Star size={14} /> 초창기 가입자 (D-{dDay})
                                    </span>
                                )}
                                {profile.has_active_pass && (
                                    <span className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full text-green-400 text-sm font-semibold">
                                        <RefreshCw size={14} /> 주간 패스 활성
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Upsell Cards Row */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Bundle Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="glass rounded-2xl p-6 space-y-4 border border-slate-700 hover:border-accent-blue/40 transition-all"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                                <Package size={20} className="text-violet-400" />
                            </div>
                            <div>
                                <h2 className="text-white font-bold text-lg">랜덤 10지문 번들</h2>
                                <p className="text-slate-400 text-sm">공개 지문 중 10개를 무작위로 묶어 PDF 한 권으로 제공</p>
                            </div>
                        </div>
                        <ul className="text-slate-400 text-sm space-y-1">
                            <li className="flex items-center gap-2"><CheckCircle size={13} className="text-accent-green" /> 다양한 분야 10지문 랜덤 구성</li>
                            <li className="flex items-center gap-2"><CheckCircle size={13} className="text-accent-green" /> A4 2단 KICE 포맷 PDF 1권</li>
                            <li className="flex items-center gap-2"><CheckCircle size={13} className="text-accent-green" /> 즉시 다운로드</li>
                        </ul>
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-2xl font-black text-white">{BUNDLE_PRICE.toLocaleString()}원</span>
                            <motion.button
                                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                onClick={handleBundlePurchase}
                                disabled={bundleLoading || bundleSuccess || publicPassageCount < 10}
                                className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all"
                            >
                                {bundleLoading ? <Loader2 size={14} className="animate-spin" /> : bundleSuccess ? '✅ 완료' : <Package size={14} />}
                                {bundleSuccess ? '다운로드 중' : '번들 구매'}
                            </motion.button>
                        </div>
                        {publicPassageCount < 10 && (
                            <p className="text-xs text-slate-600">공개 지문이 10개 이상 쌓이면 구매 가능합니다 (현재 {publicPassageCount}개)</p>
                        )}
                    </motion.div>

                    {/* Weekly Pass Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="glass rounded-2xl p-6 space-y-4 border border-slate-700 hover:border-accent-green/40 transition-all relative overflow-hidden"
                    >
                        <div className="absolute top-3 right-3 bg-accent-green/20 text-accent-green text-xs font-bold px-2 py-0.5 rounded-full border border-accent-green/30">
                            BEST
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                                <Calendar size={20} className="text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-white font-bold text-lg">주간 지문 패스</h2>
                                <p className="text-slate-400 text-sm">매주 일요일 15개 지문이 담긴 주간 PDF 자동 발송</p>
                            </div>
                        </div>
                        <ul className="text-slate-400 text-sm space-y-1">
                            <li className="flex items-center gap-2"><CheckCircle size={13} className="text-accent-green" /> 매주 15지문 자동 큐레이션</li>
                            <li className="flex items-center gap-2"><CheckCircle size={13} className="text-accent-green" /> 분야별 균형 확보</li>
                            <li className="flex items-center gap-2"><CheckCircle size={13} className="text-accent-green" /> 수능 당일(D-{dDay})까지 이용</li>
                        </ul>
                        <div className="flex items-center justify-between pt-2">
                            <div>
                                <span className="text-2xl font-black text-white">{PASS_PRICE.toLocaleString()}원</span>
                                <span className="text-slate-500 text-sm ml-2">/ 월</span>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                onClick={handlePassPurchase}
                                disabled={passLoading || passSuccess || profile.has_active_pass}
                                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all"
                            >
                                {passLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                {profile.has_active_pass ? '이용 중' : passSuccess ? '활성화 완료' : '패스 구독'}
                            </motion.button>
                        </div>
                    </motion.div>
                </div>

                {/* Purchase History */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6">
                    <h2 className="text-white font-bold text-lg mb-5">구매 내역</h2>
                    {purchases.length === 0 ? (
                        <div className="text-center py-10 text-slate-600">
                            <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm">아직 구매 내역이 없습니다</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {purchases.map((p) => (
                                <div key={p.id} className="flex items-center gap-4 p-3 bg-navy/50 rounded-xl border border-slate-800">
                                    <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                                        {p.type === 'bundle' ? <Package size={16} className="text-violet-400" /> :
                                            p.type === 'weekly_pass' ? <Calendar size={16} className="text-green-400" /> :
                                                <BookOpen size={16} className="text-accent-blue" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white font-medium truncate">
                                            {p.passages?.title ?? (p.type === 'bundle' ? '랜덤 번들 10지문' : '주간 패스')}
                                        </p>
                                        <p className="text-xs text-slate-500">{new Date(p.created_at).toLocaleDateString('ko-KR')}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="text-sm font-bold text-white">{p.amount.toLocaleString()}원</span>
                                        {p.passages && (
                                            <Link href={`/passage/${p.passages.id}`} className="block text-xs text-accent-blue hover:underline mt-0.5">열람하기</Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}

'use client';

import { Suspense, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Download, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { KICEDocument } from './pdf/KICEDocument';
import { DbPassage } from '@/types/database';

interface PdfResultViewProps {
    passage: DbPassage;
}

const subscribe = () => () => { };
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function PdfResultView({ passage }: PdfResultViewProps) {
    const isClient = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    return (
        <div className="min-h-screen bg-navy flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-green/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 glass rounded-3xl p-8 md:p-12 max-w-2xl w-full text-center space-y-8"
            >
                <div className="w-20 h-20 rounded-full bg-accent-green/20 mx-auto flex items-center justify-center">
                    <CheckCircle2 size={40} className="text-accent-green" />
                </div>

                <div className="space-y-3">
                    <span className="text-accent-blue text-sm font-bold tracking-wider uppercase">Pipeline Complete</span>
                    <h2 className="text-3xl md:text-4xl font-black text-white">결제가 완료되었습니다</h2>
                    <p className="text-slate-400 text-lg">
                        지문 생성부터 PDF 변환까지 모든 프로세스가 통합되었습니다.
                    </p>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-left space-y-2">
                    <p className="text-slate-300 text-sm">
                        <span className="text-slate-500 w-16 inline-block">주제어</span> {passage.keyword}
                    </p>
                    <p className="text-slate-300 text-sm">
                        <span className="text-slate-500 w-16 inline-block">제목</span> {passage.title}
                    </p>
                    <p className="text-slate-300 text-sm">
                        <span className="text-slate-500 w-16 inline-block">분야</span> {passage.category}
                    </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                    {/* Only render PDF link on client to prevent hydration errors */}
                    {isClient && (
                        <Suspense fallback={
                            <div className="flex items-center gap-2 bg-slate-800 text-slate-400 px-6 py-4 rounded-xl font-bold justify-center w-full sm:w-auto">
                                <span className="animate-pulse">PDF 레이아웃 준비 중...</span>
                            </div>
                        }>
                            {/* @ts-expect-error React 19 type mismatch for PDFDownloadLink children */}
                            <PDFDownloadLink
                                document={<KICEDocument passage={passage} />}
                                fileName={`KICE_Gen_${passage.category}_${passage.keyword.replace(/\s+/g, '_')}.pdf`}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-accent-green to-emerald-600 hover:from-accent-green/90 hover:to-emerald-500 text-navy font-black px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-accent-green/20"
                            >
                                {({ loading }: { loading: boolean }) => (
                                    loading ? (
                                        <span>PDF 변환 중...</span>
                                    ) : (
                                        <span className="flex items-center gap-2"><Download size={20} /> 고해상도 PDF 다운로드</span>
                                    )
                                )}
                            </PDFDownloadLink>
                        </Suspense>
                    )}

                    <Link
                        href="/"
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 border border-slate-700 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-xl transition-all"
                    >
                        홈으로 <ArrowRight size={18} />
                    </Link>
                </div>
            </motion.div >
        </div >
    );
}

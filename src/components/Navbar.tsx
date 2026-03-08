'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, User, Coins, LogOut, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
    const { user, profile, loading, fetchProfile, signOut, setShowAuthModal } = useAuthStore();

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return (
        <nav className="sticky top-0 z-50 glass border-b border-slate-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shrink-0 group-hover:shadow-lg group-hover:shadow-sky-500/30 transition-all">
                        <BookOpen size={16} className="text-white" />
                    </div>
                    <span className="font-bold text-white text-lg tracking-tight">
                        KICE<span className="text-accent-blue">-Gen</span>
                    </span>
                </Link>

                {/* Right Side */}
                <div className="flex items-center gap-3">
                    {loading ? (
                        <div className="h-7 w-24 rounded-lg bg-slate-700/50 animate-pulse" />
                    ) : user && profile ? (
                        <>
                            {/* Credits chip */}
                            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full text-amber-400 text-sm font-semibold">
                                <Coins size={14} />
                                <span>{profile.credits}크레딧</span>
                            </div>

                            {/* My page link */}
                            <Link
                                href="/mypage"
                                className="flex items-center gap-1.5 text-slate-300 hover:text-white text-sm font-medium transition-colors"
                            >
                                <User size={16} />
                                마이페이지
                            </Link>

                            {/* Sign Out */}
                            <button
                                onClick={() => signOut()}
                                className="text-slate-500 hover:text-slate-300 transition-colors"
                                title="로그아웃"
                            >
                                <LogOut size={16} />
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowAuthModal(true, 'login')}
                                className="text-slate-300 hover:text-white text-sm font-medium transition-colors px-3 py-1.5"
                            >
                                로그인
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setShowAuthModal(true, 'signup')}
                                className="flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-bold px-4 py-2 rounded-lg"
                            >
                                무료체험 시작 <ChevronRight size={14} />
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

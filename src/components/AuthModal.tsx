'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { createClient } from '@/lib/supabase/client';

export default function AuthModal() {
    const { showAuthModal, authMode, setShowAuthModal, fetchProfile } = useAuthStore();
    const [mode, setMode] = useState<'login' | 'signup'>(authMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
                throw new Error('Supabase 설정이 누락되었습니다. .env.local 파일을 확인해주세요.');
            }

            if (mode === 'signup') {
                const redirectTo = `${window.location.origin}/auth/callback`;
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { emailRedirectTo: redirectTo },
                });
                if (error) throw error;
                setMessage('이메일을 확인해주세요! 인증 후 로그인이 가능합니다.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                await fetchProfile();
                setShowAuthModal(false);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const toggle = (m: 'login' | 'signup') => {
        setMode(m);
        setError('');
        setMessage('');
    };

    return (
        <AnimatePresence>
            {showAuthModal && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowAuthModal(false)}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="pointer-events-auto w-full max-w-md bg-slate-card border border-slate-700 rounded-2xl p-8 shadow-2xl">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        {mode === 'login' ? '로그인' : '무료 회원가입'}
                                    </h2>
                                    <p className="text-slate-400 text-sm mt-1">
                                        {mode === 'signup'
                                            ? '가입 즉시 3크레딧 + 초창기 가입자 혜택 자동 적용'
                                            : '다시 돌아오셨군요!'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowAuthModal(false)}
                                    className="text-slate-500 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex rounded-xl bg-navy p-1 mb-6">
                                {(['login', 'signup'] as const).map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => toggle(m)}
                                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === m
                                            ? 'bg-slate-700 text-white shadow-md'
                                            : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                    >
                                        {m === 'login' ? '로그인' : '회원가입'}
                                    </button>
                                ))}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="이메일"
                                        className="w-full bg-navy border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-accent-blue transition-colors"
                                    />
                                </div>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        placeholder="비밀번호 (6자 이상)"
                                        className="w-full bg-navy border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-accent-blue transition-colors"
                                    />
                                </div>

                                {error && (
                                    <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                                        {error}
                                    </p>
                                )}
                                {message && (
                                    <p className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-2">
                                        {message}
                                    </p>
                                )}

                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all text-sm"
                                >
                                    {loading && <Loader2 size={16} className="animate-spin" />}
                                    {mode === 'login' ? '로그인' : '무료로 시작하기'}
                                </motion.button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        const { mockLogin } = useAuthStore.getState();
                                        mockLogin();
                                    }}
                                    className="w-full mt-4 text-xs text-slate-500 hover:text-accent-blue transition-colors underline"
                                >
                                    개발자 전용 목업 로그인 (임시 아이디/비번 없이 입장)
                                </button>
                            </form>

                            {mode === 'signup' && (
                                <p className="text-center text-xs text-slate-600 mt-4">
                                    가입 시 이용약관 및 개인정보처리방침에 동의합니다.
                                </p>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

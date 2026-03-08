'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function AuthErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 mesh-bg">
            <div className="glass rounded-2xl p-10 max-w-sm w-full text-center">
                <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
                <h1 className="text-2xl font-black text-white mb-2">인증 오류</h1>
                <p className="text-slate-400 text-sm mb-6">
                    이메일 인증 링크가 만료되었거나 올바르지 않습니다.
                    <br />
                    다시 가입 또는 로그인을 시도해 주세요.
                </p>
                <Link
                    href="/"
                    className="inline-block bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
                >
                    홈으로 돌아가기
                </Link>
            </div>
        </div>
    );
}

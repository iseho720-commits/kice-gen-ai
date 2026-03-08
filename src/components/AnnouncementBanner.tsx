'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDDayCount } from '@/lib/utils';

export default function AnnouncementBanner() {
    const [dDay, setDDay] = useState<number | null>(null);

    useEffect(() => {
        setDDay(getDDayCount());
        const interval = setInterval(() => setDDay(getDDayCount()), 60000);
        return () => clearInterval(interval);
    }, []);

    if (dDay === null) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full bg-gradient-to-r from-sky-500 via-blue-500 to-violet-600 py-2 px-4 text-center text-sm font-semibold text-white relative overflow-hidden"
            >
                {/* Shimmer */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
                <span className="relative z-10 flex flex-wrap items-center justify-center gap-2">
                    <span className="pulse-glow">🔥</span>
                    <span>초창기 가입자 한정: 지금 가입하면 수능 날까지 지문 무제한 500원!</span>
                    <span className="bg-white/20 rounded-full px-3 py-0.5 text-xs font-bold border border-white/30">
                        D-{dDay}
                    </span>
                </span>
            </motion.div>
        </AnimatePresence>
    );
}

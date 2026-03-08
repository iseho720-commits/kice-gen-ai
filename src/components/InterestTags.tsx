'use client';

import { motion } from 'framer-motion';

const INTEREST_TAGS = [
    { emoji: '🎵', label: '아이돌 경제학', keyword: '아이돌 경제학' },
    { emoji: '🎮', label: '게임 메커니즘', keyword: '게임 메커니즘' },
    { emoji: '🧠', label: '신경과학', keyword: '신경과학과 의사결정' },
    { emoji: '📈', label: '행동경제학', keyword: '행동경제학과 넛지' },
    { emoji: '🤖', label: 'AI 윤리', keyword: '인공지능 윤리' },
    { emoji: '🌍', label: '기후 변화', keyword: '기후 변화와 탄소 경제' },
    { emoji: '⚽', label: '스포츠 과학', keyword: '스포츠 과학과 운동생리학' },
    { emoji: '🎬', label: '영화 서사학', keyword: '영화 서사 구조' },
    { emoji: '🍕', label: '식품 공학', keyword: '식품 공학과 발효 과학' },
    { emoji: '🚀', label: '우주 경제', keyword: '우주 산업과 상업화' },
    { emoji: '💊', label: '제약 산업', keyword: '제약 산업과 신약 개발' },
    { emoji: '🎨', label: '현대 미술 시장', keyword: '현대 미술 시장의 경제학' },
];

interface InterestTagsProps {
    onTagClick: (keyword: string) => void;
}

export default function InterestTags({ onTagClick }: InterestTagsProps) {
    return (
        <div className="flex flex-wrap gap-2 justify-center max-w-3xl mx-auto">
            {INTEREST_TAGS.map((tag, i) => (
                <motion.button
                    key={tag.keyword}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    whileHover={{ scale: 1.08, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onTagClick(tag.keyword)}
                    className="interest-tag glass px-3 py-1.5 rounded-full text-sm font-medium text-slate-300 hover:text-white hover:border-accent-blue/60 cursor-pointer"
                >
                    <span className="mr-1">{tag.emoji}</span>
                    {tag.label}
                </motion.button>
            ))}
        </div>
    );
}

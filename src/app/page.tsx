'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import Navbar from '@/components/Navbar';
import InterestTags from '@/components/InterestTags';
import GenerateInput from '@/components/GenerateInput';
import AuthModal from '@/components/AuthModal';
import { Lock, FileText, BrainCircuit, Zap, Shield, BookOpen } from 'lucide-react';

const HOW_IT_WORKS = [
  {
    icon: BrainCircuit,
    title: '관심사 입력',
    desc: '좋아하는 주제, 시사 이슈, 학문 분야 뭐든지 좋습니다.',
    color: 'from-sky-500 to-blue-600',
  },
  {
    icon: Zap,
    title: 'AI 분석 & 생성',
    desc: '평가원 출제 로직(화제 도입→변수A→대립항B→상관관계→한계)으로 5문단 지문 자동 설계.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: FileText,
    title: 'KICE PDF 다운로드',
    desc: '실제 수능지 2단 구성, 나눔명조 서체. 인쇄해서 바로 풀 수 있는 퀄리티.',
    color: 'from-emerald-500 to-green-600',
  },
];

const STATS = [
  { value: '5문단', label: '평가원 형식 구조' },
  { value: '500원', label: '초창기 무제한 1지문' },
  { value: '3회', label: '무료 체험 횟수' },
  { value: '2단', label: '실제 수능지 레이아웃' },
];

const EXAMPLE_TOPICS = [
  { cat: '문화', title: '아이돌 IP와 굿즈 경제학', preview: '1. 아이돌 그룹의 지식재산권(IP)은 음원 외에도 굿즈, 팬덤 서비스 등 다층적인 수익 구조를 형성한다. 이때 핵심 변수는...' },
  { cat: '기술', title: '딥러닝 역전파 알고리즘', preview: '1. 인공신경망의 학습은 순전파(forward propagation)를 통해 예측값을 산출하고, 오차를 역방향으로 전파하는 과정을 반복한다...' },
];

export default function HomePage() {
  const [keyword, setKeyword] = useState('');

  return (
    <div className="min-h-screen flex flex-col mesh-bg">
      <AnnouncementBanner />
      <Navbar />
      <AuthModal />

      <main className="flex-1">
        {/* ── Hero Section ── */}
        <section className="pt-20 pb-16 px-4 text-center relative overflow-hidden">
          {/* Background blobs */}
          <div className="absolute -top-40 left-1/4 w-96 h-96 rounded-full bg-sky-500/5 blur-3xl pointer-events-none" />
          <div className="absolute top-20 right-1/4 w-72 h-72 rounded-full bg-violet-500/5 blur-3xl pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block glass text-accent-blue text-xs font-bold px-4 py-1.5 rounded-full mb-6 border border-accent-blue/30">
              🎯 AI 기반 수능 비문학 지문 생성기
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-4">
              독서량이 아니라<br />
              <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-violet-400 bg-clip-text text-transparent glow-text-blue">
                평가원의 논리
              </span>를 묻습니다.
            </h1>

            <p className="text-slate-400 text-lg max-w-xl mx-auto mb-12">
              당신의 관심사로 실제 수능 형식의 비문학 지문을 생성하고,
              PDF로 출력해 바로 연습하세요.
            </p>
          </motion.div>

          {/* Search Input */}
          <GenerateInput value={keyword} onChange={setKeyword} />

          {/* Interest Tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <p className="text-slate-600 text-xs mb-3">주제 예시 클릭</p>
            <InterestTags onTagClick={setKeyword} />
          </motion.div>
        </section>

        {/* ── Stats Bar ── */}
        <section className="border-y border-slate-800/60 bg-slate-card/40 py-8 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <p className="text-2xl sm:text-3xl font-black text-accent-blue">{s.value}</p>
                <p className="text-slate-400 text-sm mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── How it Works ── */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-white mb-3">이렇게 작동합니다</h2>
              <p className="text-slate-400">3단계면 수능 형식 지문이 준비됩니다</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {HOW_IT_WORKS.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="glass rounded-2xl p-6 hover:border-accent-blue/30 transition-all group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <item.icon size={22} className="text-white" />
                  </div>
                  <div className="text-xs text-slate-500 mb-1">STEP {i + 1}</div>
                  <h3 className="font-bold text-white text-lg mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Sample Passages Preview ── */}
        <section className="py-16 px-4 bg-slate-card/20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-white mb-3">실제 생성 예시</h2>
              <p className="text-slate-400 text-sm">평가원 형식 5문단 구조를 그대로 따릅니다</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {EXAMPLE_TOPICS.map((ex, i) => (
                <motion.div
                  key={ex.title}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="glass rounded-2xl p-6 relative overflow-hidden"
                >
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-accent-blue/10 text-accent-blue border border-accent-blue/20 mb-3 inline-block">
                    {ex.cat}
                  </span>
                  <h3 className="font-bold text-white text-lg mb-3">{ex.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-myeongjo">{ex.preview}</p>

                  {/* Blur fade - simulating the paywall */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-card to-transparent" />
                  <div className="mt-4 flex items-center gap-2 text-slate-500 text-xs">
                    <Lock size={12} />
                    2-5문단 보기 위해 로그인 필요
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Section ── */}
        <section className="py-20 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto glass rounded-3xl p-10 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-violet-500/5" />
            <div className="relative z-10">
              <Shield size={40} className="text-accent-green mx-auto mb-4" />
              <h2 className="text-3xl font-black text-white mb-3">
                지금 시작하면 3지문 무료
              </h2>
              <p className="text-slate-400 mb-6">
                가입 즉시 3크레딧 지급 + 초창기 가입자 혜택 (수능 날까지 500원 고정)
              </p>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-lg px-8 py-4 rounded-2xl glow-blue transition-all"
              >
                무료로 체험하기 →
              </motion.button>
              <p className="text-xs text-slate-600 mt-4 flex items-center justify-center gap-1">
                <BookOpen size={12} />
                신용카드 불필요 · 3지문 무료
              </p>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/40 py-8 px-4 text-center text-slate-600 text-sm">
        <p>© 2026 KICE-Gen AI. 평가원의 논리로 만들어진 지문.</p>
      </footer>
    </div>
  );
}

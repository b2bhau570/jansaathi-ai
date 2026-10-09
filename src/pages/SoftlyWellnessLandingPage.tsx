// 'Softly' - Digital Wellness Landing Page
// Designed with a warm, desaturated pastel palette, high-end grain textures, and fluid, low-velocity animations.
// Feel: 'Digital Living Room' — minimalist, tactile, and intentionally slow.

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  Plus,
  Minus,
  Heart,
  Volume2,
  VolumeX,
  Smile,
  Moon,
  Sun,
  Wind,
  Coffee,
  Check,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface ScenarioCard {
  time: string;
  scenario: string;
  tag: string;
  accent: string;
}

const scenarios: ScenarioCard[] = [
  {
    time: '07:15 am',
    scenario: 'Holding a warm mug with two hands before touching the screen.',
    tag: 'Morning pause',
    accent: 'hover:text-[#FFB7B2]',
  },
  {
    time: '01:30 pm',
    scenario: 'Replacing lunchtime doomscrolling with three slow, deep breaths.',
    tag: 'Midday reset',
    accent: 'hover:text-[#9FB19F]',
  },
  {
    time: '05:45 pm',
    scenario: 'A quiet walk through the neighborhood, listening only to the wind.',
    tag: 'Offline commute',
    accent: 'hover:text-[#A7A0C0]',
  },
  {
    time: '09:10 pm',
    scenario: 'Turning noisy group chats into a muted, tranquil sanctuary.',
    tag: 'Notification diet',
    accent: 'hover:text-[#FFB7B2]',
  },
  {
    time: '11:00 pm',
    scenario: 'Phone placed face-down on the nightstand, resting until sunlight.',
    tag: 'Digital sunset',
    accent: 'hover:text-[#A7A0C0]',
  },
  {
    time: 'Sunday 10 am',
    scenario: 'A slow morning reading physical paper pages in warm sunlight.',
    tag: 'Analog ritual',
    accent: 'hover:text-[#9FB19F]',
  },
];

interface DiaryEntry {
  quote: string;
  author: string;
  city: string;
  rotation: string;
  reflection: string;
}

const diaryEntries: DiaryEntry[] = [
  {
    quote:
      'I stopped waking up with that electric, hurried pulse in my chest. Softly gave me back the first quiet half-hour of my day.',
    author: 'Elena Vance',
    city: 'Brooklyn, NY',
    rotation: '-rotate-1',
    reflection: '14 days of silent mornings',
  },
  {
    quote:
      'It feels like sitting by a warm bay window on a rainy Tuesday. No streaks, no guilt, just gentle permission to put the glass rectangle away.',
    author: 'Julian Croft',
    city: 'Portland, OR',
    rotation: 'rotate-1',
    reflection: 'Screen time down 2.4 hrs/day',
  },
  {
    quote:
      'The single-button breathwork on the lock screen replaced my nervous habit of opening social media every ten minutes.',
    author: 'Maya Lin',
    city: 'Vancouver, BC',
    rotation: 'rotate-1',
    reflection: 'Replaced 42 daily unlocks',
  },
  {
    quote:
      'Most wellness apps shout at you to meditate. Softly just dims the room and lets you be a human being again.',
    author: 'Noah Bennett',
    city: 'Melbourne, AU',
    rotation: '-rotate-1',
    reflection: 'Restored bedtime routine',
  },
];

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: 'How is Softly different from strict screen-time blockers?',
    answer:
      'Blockers treat your relationship with technology like a punishment with red alarms and lockouts. Softly is an analog living room. We use tactile pacing, gentle micro-pauses, and ambient prompts so choosing presence feels natural, never punitive.',
  },
  {
    question: 'Does the app shame me if I spend too much time on my phone?',
    answer:
      'Never. There are no loud badges, red counters, or guilt-inducing weekly percentages. Instead, Softly reflects your intentional moments and celebrates times you chose real life over feeds.',
  },
  {
    question: 'How does the interactive Breathe circle work?',
    answer:
      'A low-velocity 4-second box-breathing cycle designed alongside clinical somatic psychologists. Tap to begin, follow the soft coral pulse, and let your nervous system downshift in 60 seconds.',
  },
  {
    question: 'Is my reflection journal data private and encrypted?',
    answer:
      'Completely. All reflections, diary prompts, and breathing sessions stay stored locally on your device with on-device hardware encryption. We never sell or train models on your private thoughts.',
  },
  {
    question: 'When will the public release roll out to iOS and Android?',
    answer:
      'We are gradually welcoming 250 waitlist members every Friday to preserve our slow community pacing. Early supporters receive permanent founding access and hand-crafted analog icons.',
  },
];

export const SoftlyWellnessLandingPage: React.FC = () => {
  // Waitlist submission state
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Interactive Breathe tool in Center Phone Mockup
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathePhase, setBreathePhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breatheCount, setBreatheCount] = useState(4);

  // Horizontal scenario scroll reference
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Breathe rhythm cycle
  useEffect(() => {
    if (!isBreathing) return;

    let counter = 4;
    setBreathePhase('Inhale');
    setBreatheCount(4);

    const phases: Array<'Inhale' | 'Hold' | 'Exhale' | 'Rest'> = ['Inhale', 'Hold', 'Exhale', 'Rest'];
    let phaseIdx = 0;

    const interval = setInterval(() => {
      counter--;
      if (counter <= 0) {
        phaseIdx = (phaseIdx + 1) % phases.length;
        setBreathePhase(phases[phaseIdx]);
        counter = 4;
      }
      setBreatheCount(counter);
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathing]);

  const handleScrollScenarios = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === 'left' ? -320 : 320;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#292524] font-outfit antialiased selection:bg-[#FFB7B2]/40 selection:text-[#292524] relative overflow-x-hidden">
      {/* 1. Global 0.35 opacity fractal noise grain overlay */}
      <div className="softly-grain-overlay" aria-hidden="true" />

      {/* 2. Floating Ambient Background Pastel Blobs */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        {/* Peach / Mist Rose Blob Top Right */}
        <div className="absolute -top-24 -right-24 w-[520px] h-[520px] rounded-full bg-[#FFE4E1] opacity-60 blur-[130px] animate-softly-float-a" />
        {/* Lavender Blob Top Left */}
        <div className="absolute top-1/4 -left-36 w-[580px] h-[580px] rounded-full bg-[#E6E6FA] opacity-60 blur-[140px] animate-softly-float-b" />
        {/* Sage Green Blob Mid Bottom */}
        <div className="absolute top-2/3 right-1/4 w-[480px] h-[480px] rounded-full bg-[#E8EFE8] opacity-50 blur-[120px] animate-softly-float-a" />
        {/* Soft Peach Bottom Left */}
        <div className="absolute -bottom-20 -left-20 w-[540px] h-[540px] rounded-full bg-[#FFE4E1] opacity-50 blur-[140px] animate-softly-float-b" />
      </div>

      {/* 3. Floating Pill-Shaped Navigation Bar */}
      <header className="sticky top-4 z-40 px-4 max-w-4xl mx-auto w-full">
        <nav className="w-full bg-white/70 backdrop-blur-[20px] border border-stone-200/50 rounded-full px-4 sm:px-6 py-3 softly-shadow flex items-center justify-between transition-all">
          {/* Logo */}
          <a href="#hero" className="flex items-center gap-2.5 group">
            <span className="w-6 h-6 rounded-full bg-[#FFB7B2] flex items-center justify-center softly-shadow transition-transform group-hover:scale-105">
              <span className="w-2 h-2 rounded-full bg-white" />
            </span>
            <span className="text-lg font-medium text-[#292524] tracking-tight">Softly</span>
            <span className="hidden sm:inline-block text-[11px] font-reenie text-stone-400 transform -rotate-3">
              living room
            </span>
          </a>

          {/* Center Links (Desktop) */}
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-[#78716C]">
            <a href="#scenarios" className="hover:text-[#292524] transition-colors">
              Moments
            </a>
            <a href="#preview" className="hover:text-[#292524] transition-colors">
              Experience
            </a>
            <a href="#diary" className="hover:text-[#292524] transition-colors">
              Diary
            </a>
            <a href="#faq" className="hover:text-[#292524] transition-colors">
              Questions
            </a>
          </div>

          {/* Dark Stone CTA Pill */}
          <a
            href="#waitlist"
            className="bg-[#292524] text-white hover:bg-stone-800 text-xs sm:text-sm font-medium px-5 sm:px-6 py-2.5 rounded-full softly-shadow hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Join waitlist
          </a>
        </nav>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="relative z-10">
        {/* =========================================================================
            HERO SECTION
            ========================================================================= */}
        <section id="hero" className="pt-16 sm:pt-24 pb-20 sm:pb-28 px-5 sm:px-8 text-center max-w-4xl mx-auto">
          {/* Subtle micro tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-stone-200/60 softly-shadow text-xs text-[#78716C] mb-8 animate-softly-float-a">
            <span className="w-2 h-2 rounded-full bg-[#FFB7B2] animate-pulse" />
            <span>Digital wellness for an unhurried generation</span>
          </div>

          {/* Headline with Reenie Beanie cursive insertion */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-normal leading-[1.06] tracking-[-0.025em] text-[#292524] max-w-3xl mx-auto">
            Live a little more{' '}
            <span className="font-reenie text-6xl sm:text-8xl md:text-9xl text-[#FFB7B2] font-normal inline-block transform -rotate-3 mx-1 hover:rotate-0 transition-transform">
              softly
            </span>{' '}
            in a loud, hurried world.
          </h1>

          {/* Sub-headline */}
          <p className="mt-7 text-base sm:text-lg text-[#78716C] max-w-[500px] mx-auto font-normal leading-relaxed">
            A minimalist digital living room for your phone. Swap dopamine loops and notification anxiety for tactile
            rituals, slow breathwork, and quiet peace.
          </p>

          {/* Dual CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto">
            <a
              href="#waitlist"
              className="w-full sm:w-auto bg-[#FFB7B2] hover:bg-[#ffa9a3] text-[#292524] text-sm sm:text-base font-medium px-8 py-3.5 rounded-full softly-shadow hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>Step into the room</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="#preview"
              className="w-full sm:w-auto bg-white hover:bg-stone-50 text-[#292524] border border-stone-200/80 text-sm sm:text-base font-medium px-8 py-3.5 rounded-full softly-shadow hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Explore the app
            </a>
          </div>

          {/* Pacing indicator */}
          <div className="mt-12 flex items-center justify-center gap-6 text-xs text-[#78716C] font-medium">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Zero ads or feeds
            </span>
            <span>&bull;</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFB7B2]" />
              On-device encrypted
            </span>
            <span>&bull;</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-300" />
              No streaks or guilt
            </span>
          </div>
        </section>

        {/* =========================================================================
            HORIZONTAL SCENARIO SCROLL
            ========================================================================= */}
        <section id="scenarios" className="py-16 sm:py-20 border-y border-stone-200/50 bg-white/40 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-stone-400 block mb-1">
                  Tactile Living Moments
                </span>
                <h2 className="text-3xl sm:text-4xl font-normal text-[#292524] tracking-tight">
                  Little pauses throughout your day.
                </h2>
              </div>

              {/* Scroll buttons */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleScrollScenarios('left')}
                  className="w-10 h-10 rounded-full bg-white border border-stone-200/70 flex items-center justify-center text-stone-600 hover:text-[#292524] hover:bg-stone-50 softly-shadow transition-all"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleScrollScenarios('right')}
                  className="w-10 h-10 rounded-full bg-white border border-stone-200/70 flex items-center justify-center text-stone-600 hover:text-[#292524] hover:bg-stone-50 softly-shadow transition-all"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Horizontal card strip */}
            <div
              ref={scrollContainerRef}
              className="flex items-center gap-5 overflow-x-auto no-scrollbar pb-6 pt-2 -mx-5 px-5 sm:mx-0 sm:px-0 scroll-smooth snap-x snap-mandatory"
            >
              {scenarios.map((item, idx) => (
                <div
                  key={idx}
                  className="w-[288px] h-[160px] shrink-0 bg-white rounded-3xl p-5 softly-shadow border border-stone-200/40 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300 snap-start"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-stone-400">{item.time}</span>
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-stone-50 text-stone-500 border border-stone-200/40">
                      {item.tag}
                    </span>
                  </div>

                  <p
                    className={`text-[20px] font-normal text-[#292524] leading-snug tracking-tight transition-colors duration-300 ${item.accent}`}
                  >
                    {item.scenario}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            APP EXPERIENCE PREVIEW (THREE-MOCKUP STACKED LAYOUT)
            ========================================================================= */}
        <section id="preview" className="py-24 sm:py-32 px-5 sm:px-8 max-w-6xl mx-auto overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
            <span className="text-xs font-medium uppercase tracking-wider text-stone-400 block mb-2">
              Inside the digital living room
            </span>
            <h2 className="text-3xl sm:text-5xl font-normal text-[#292524] tracking-tight">
              An interface that feels like unvarnished linen.
            </h2>
            <p className="mt-4 text-[#78716C] text-base leading-relaxed">
              Designed with generous negative space, gentle typography, and slow interactions that respect your nervous
              system.
            </p>
          </div>

          {/* Three-mockup cascading stack */}
          <div className="relative flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-6 pt-4 pb-12">
            {/* LEFT PHONE: 280x580, 80% opacity, +48px translation, Sage background */}
            <div className="w-[280px] h-[580px] rounded-[44px] bg-[#E8EFE8] border-[8px] border-white softly-shadow-md opacity-80 transform lg:translate-y-[48px] p-6 flex flex-col justify-between shrink-0 hover:opacity-100 hover:scale-[1.02] transition-all duration-500">
              {/* Top speaker notch */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-stone-500">09:41</span>
                <div className="w-16 h-3 rounded-full bg-stone-300/40" />
                <span className="text-[11px] font-medium text-stone-500">Offline</span>
              </div>

              {/* Screen Body */}
              <div className="my-auto space-y-5">
                <div className="inline-block px-3 py-1 rounded-full bg-white/70 text-xs text-stone-700 font-medium">
                  ✦ Morning reflection
                </div>
                <h3 className="text-2xl font-normal text-[#292524] leading-snug">
                  What is one thing you don’t need to rush today?
                </h3>
                <div className="p-4 rounded-2xl bg-white/60 border border-white/80 text-xs text-stone-600 leading-relaxed font-reenie text-xl">
                  "Letting the coffee sit on my tongue before opening the laptop."
                </div>
              </div>

              {/* Footer Indicator */}
              <div className="p-3 rounded-2xl bg-white/70 flex items-center justify-between text-xs text-stone-600">
                <span>Notification diet</span>
                <span className="font-semibold text-emerald-800">Active</span>
              </div>
            </div>

            {/* CENTER PHONE: 300x620, fully opaque, Coral pulsing Breathe button */}
            <div className="w-[300px] h-[620px] rounded-[48px] bg-white border-[10px] border-white softly-shadow-md z-20 shrink-0 p-7 flex flex-col justify-between relative overflow-hidden ring-1 ring-stone-200/40">
              {/* Speaker Bar */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-400">Softly</span>
                <div className="w-20 h-4 rounded-full bg-stone-100" />
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>

              {/* Center Screen: Interactive Breathwork */}
              <div className="my-auto text-center space-y-6">
                <div>
                  <span className="text-xs uppercase tracking-widest text-stone-400 font-medium">Somatic Reset</span>
                  <h3 className="text-2xl font-normal text-[#292524] mt-1">Four-second pause</h3>
                  <p className="text-xs text-[#78716C] mt-1">Tap the circle below to sync your rhythm.</p>
                </div>

                {/* Breathing Circle Button */}
                <div className="flex flex-col items-center justify-center py-4">
                  <button
                    type="button"
                    onClick={() => setIsBreathing((prev) => !prev)}
                    className={`w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                      isBreathing
                        ? 'bg-[#FFB7B2] text-[#292524] animate-softly-breathe'
                        : 'bg-[#FFB7B2] hover:bg-[#ffa9a3] text-[#292524] softly-shadow hover:scale-105 active:scale-95'
                    }`}
                    title="Click to start 4-second breathwork"
                  >
                    <span className="text-lg font-medium tracking-tight">
                      {isBreathing ? breathePhase : 'Breathe'}
                    </span>
                    <span className="text-xs font-mono text-[#292524]/70 mt-0.5">
                      {isBreathing ? `${breatheCount}s` : 'Tap to start'}
                    </span>
                  </button>
                </div>

                <div className="text-[11px] text-stone-400 font-medium">
                  {isBreathing ? 'Inhale through the nose • Exhale slowly' : '60 seconds lowers sympathetic arousal'}
                </div>
              </div>

              {/* Bottom Phone Bar */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-around text-xs text-stone-400">
                <span className="font-medium text-[#292524]">Now</span>
                <span>Rituals</span>
                <span>Sounds</span>
              </div>
            </div>

            {/* RIGHT PHONE: 280x580, 80% opacity, +96px translation, Lavender background */}
            <div className="w-[280px] h-[580px] rounded-[44px] bg-[#EFEDF4] border-[8px] border-white softly-shadow-md opacity-80 transform lg:translate-y-[96px] p-6 flex flex-col justify-between shrink-0 hover:opacity-100 hover:scale-[1.02] transition-all duration-500">
              {/* Top speaker notch */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-stone-500">Audio</span>
                <div className="w-16 h-3 rounded-full bg-stone-300/40" />
                <span className="text-[11px] font-medium text-stone-500">432 Hz</span>
              </div>

              {/* Screen Body: Ambient Sanctuary */}
              <div className="my-auto space-y-5">
                <div className="inline-block px-3 py-1 rounded-full bg-white/70 text-xs text-stone-700 font-medium">
                  ✦ Sound sanctuary
                </div>
                <h3 className="text-2xl font-normal text-[#292524] leading-snug">Rain hitting cedar shingles.</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Real uncompressed acoustic recordings without synthetic loops or harsh high frequencies.
                </p>

                {/* Sound wave bar mock */}
                <div className="flex items-center gap-1.5 pt-2">
                  {[24, 40, 16, 32, 48, 20, 36, 52, 16, 28, 44, 20].map((h, i) => (
                    <span
                      key={i}
                      style={{ height: `${h}px` }}
                      className="w-1.5 rounded-full bg-stone-400/50 inline-block animate-pulse"
                    />
                  ))}
                </div>
              </div>

              {/* Footer Indicator */}
              <div className="p-3 rounded-2xl bg-white/70 flex items-center justify-between text-xs text-stone-600">
                <span>Sleep timer</span>
                <span className="font-semibold text-purple-900">30 mins</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            DIARY ENTRY TESTIMONIALS (TWO-COLUMN GRID, ROTATION +/-1 DEGREE)
            ========================================================================= */}
        <section id="diary" className="py-20 sm:py-28 px-5 sm:px-8 max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-14 sm:mb-16">
            <span className="text-xs font-medium uppercase tracking-wider text-stone-400 block mb-2">
              Field notes & handwritten reflections
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal text-[#292524] tracking-tight">
              Stories from people who slowed down.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-7 sm:gap-8">
            {diaryEntries.map((entry, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-[32px] p-8 sm:p-9 softly-shadow border border-stone-200/50 flex flex-col justify-between transform ${entry.rotation} hover:rotate-0 hover:scale-[1.01] transition-all duration-300`}
              >
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-stone-400 mb-4 flex items-center justify-between">
                    <span>Entry #{idx + 1}</span>
                    <span className="text-stone-400 font-sans">{entry.reflection}</span>
                  </div>

                  <p className="text-lg sm:text-xl font-normal text-[#292524] leading-relaxed tracking-tight">
                    &ldquo;{entry.quote}&rdquo;
                  </p>
                </div>

                {/* Signature Style: 32px line followed by Reenie Beanie cursive */}
                <div className="mt-8 pt-5 border-t border-stone-100 flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-stone-300 inline-block" />
                  <span className="font-reenie text-2xl text-stone-500 leading-none">
                    {entry.author}, <span className="text-stone-400">{entry.city}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            INTERACTIVE FAQ ACCORDION (SMOOTH 500MS ACCORDION EXPANSION)
            ========================================================================= */}
        <section id="faq" className="py-20 sm:py-24 px-5 sm:px-8 max-w-3xl mx-auto">
          <div className="text-center mb-12 sm:mb-14">
            <span className="text-xs font-medium uppercase tracking-wider text-stone-400 block mb-2">
              Gentle clarity
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal text-[#292524] tracking-tight">
              Frequently asked questions.
            </h2>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-[16px] border border-stone-100 softly-shadow overflow-hidden transition-all duration-300"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 font-medium text-base sm:text-lg text-[#292524] hover:text-[#FFB7B2] transition-colors"
                  >
                    <span>{faq.question}</span>
                    <span
                      className={`w-7 h-7 rounded-full bg-stone-50 border border-stone-200/50 flex items-center justify-center text-stone-500 transition-transform duration-500 ease-in-out shrink-0 ${
                        isOpen ? 'rotate-45 text-[#FFB7B2]' : ''
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                    </span>
                  </button>

                  {/* Accordion Content with 500ms transition */}
                  <div
                    className={`transition-all duration-500 ease-in-out overflow-hidden ${
                      isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 pb-6 text-sm sm:text-base text-[#78716C] leading-relaxed font-normal">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            WAITLIST CONVERSION SECTION
            ========================================================================= */}
        <section id="waitlist" className="py-24 sm:py-32 px-5 sm:px-8 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto relative z-10 bg-white/80 backdrop-blur-md rounded-[40px] sm:rounded-[48px] p-8 sm:p-14 border border-stone-200/60 softly-shadow-md">
            {/* Dark stone #292524 rounded-square icon at top with coral dot */}
            <div className="w-14 h-14 rounded-2xl bg-[#292524] mx-auto flex items-center justify-center softly-shadow mb-6">
              <span className="w-3.5 h-3.5 rounded-full bg-[#FFB7B2]" />
            </div>

            <h2 className="text-3xl sm:text-5xl font-normal text-[#292524] tracking-tight">
              Reserve your corner in the living room.
            </h2>

            <p className="mt-4 text-[#78716C] text-base max-w-md mx-auto leading-relaxed font-normal">
              We welcome 250 members each week to keep the atmosphere unhurried. No spam, ever.
            </p>

            {/* Waitlist Form */}
            {!isSubmitted ? (
              <form onSubmit={handleWaitlistSubmit} className="mt-8 max-w-md mx-auto flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  placeholder="Your quiet email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-stone-50 border border-stone-200/80 rounded-full px-6 py-3.5 text-sm sm:text-base text-[#292524] placeholder:text-stone-400 focus:outline-none focus:border-[#FFB7B2] focus:bg-white transition-all softly-shadow"
                />
                <button
                  type="submit"
                  className="bg-[#292524] text-white hover:bg-stone-800 text-sm sm:text-base font-medium px-8 py-3.5 rounded-full softly-shadow hover:scale-105 active:scale-95 transition-all duration-300 shrink-0"
                >
                  Join waitlist
                </button>
              </form>
            ) : (
              <div className="mt-8 p-5 rounded-3xl bg-[#E8EFE8] border border-emerald-200/80 text-emerald-900 text-sm sm:text-base font-medium softly-shadow flex items-center justify-center gap-2">
                <Check className="w-5 h-5 text-emerald-700" />
                <span>You are on the list! Welcome to the living room ✦</span>
              </div>
            )}

            <div className="mt-6 text-xs text-stone-400 font-medium">
              Join 8,400+ people reclaiming quiet attention • Free founder invite
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-12 px-5 sm:px-8 border-t border-stone-200/50 bg-[#FDFCF8] text-xs text-[#78716C] relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#FFB7B2] flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            </span>
            <span className="font-medium text-[#292524] text-sm">Softly</span>
            <span className="text-stone-400">&bull; An intentionally slow digital wellness app</span>
          </div>

          <div className="flex items-center gap-5 font-medium">
            <a href="#hero" className="hover:text-[#292524] transition-colors">
              Top
            </a>
            <a href="#scenarios" className="hover:text-[#292524] transition-colors">
              Moments
            </a>
            <a href="#preview" className="hover:text-[#292524] transition-colors">
              Experience
            </a>
            <a href="#waitlist" className="hover:text-[#292524] transition-colors">
              Waitlist
            </a>
          </div>

          <div className="text-stone-400">
            &copy; {new Date().getFullYear()} Softly. Made for human presence.
          </div>
        </div>
      </footer>
    </div>
  );
};

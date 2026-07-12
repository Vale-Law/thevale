import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { User, Star, Calendar, Video } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

// New order: 01 Pick your lawyer, 02 Schedule a time, 03 Create your account, 04 Meet online
const STEPS = [
  { key: 'step2', num: 1 },
  { key: 'step3', num: 2 },
  { key: 'step1', num: 3 },
  { key: 'step4', num: 4 },
];

/* ---------- Visual cards (one per step, with original icons) ---------- */

function AttorneyVisual() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-5 w-full max-w-xs border border-[#E5E2DC]">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-[#EAF2FB] flex items-center justify-center shrink-0">
          <span className="font-serif text-[#0a5dc2] text-sm font-medium">SM</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-serif font-medium text-[14px] text-[#111418] truncate">Sarah Mitchell</h4>
          <p className="text-[11px] text-[#8A8578] font-body">Family Law</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="w-3 h-3 fill-[#F5A623] text-[#F5A623]" />
            <span className="text-[11px] font-medium text-[#111418]">4.9</span>
            <span className="text-[11px] text-[#8A8578]">· 127 reviews</span>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-[#8A8578] font-body mb-3">Next available today</p>
      <div className="h-8 bg-[#F1EEE8] rounded-full flex items-center justify-center">
        <span className="text-[11px] text-[#111418] font-body font-medium">Book online</span>
      </div>
    </div>
  );
}

function CalendarVisual() {
  const dates = [12, 13, 14, 15, 16, 17, 18];
  const slots = ['9:00 AM', '10:30 AM', '2:00 PM', '4:30 PM'];
  return (
    <div className="bg-white rounded-2xl shadow-xl p-5 w-full max-w-xs border border-[#E5E2DC]">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-serif font-medium text-[14px] text-[#111418]">July 2026</h4>
        <Calendar className="w-4 h-4 text-[#8A8578]" strokeWidth={1.5} />
      </div>
      <div className="grid grid-cols-7 gap-1 mb-4">
        {dates.map((d, i) => (
          <div key={i} className={`text-center text-[10px] font-body py-1.5 rounded ${i === 2 ? 'bg-[#0a5dc2] text-white font-medium' : 'text-[#8A8578]'}`}>{d}</div>
        ))}
      </div>
      <div className="space-y-2">
        {slots.map((s, i) => (
          <div key={i} className={`h-7 rounded-lg flex items-center px-3 ${i === 1 ? 'bg-[#0a5dc2]' : 'bg-[#F5F0E8]'}`}>
            <span className={`text-[11px] font-body ${i === 1 ? 'text-white font-medium' : 'text-[#8A8578]'}`}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AccountVisual() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xs border border-[#E5E2DC]">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-full bg-[#EAF2FB] flex items-center justify-center">
          <User className="w-6 h-6 text-[#0a5dc2]" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <div className="h-2.5 w-20 bg-[#E5E2DC] rounded-full" />
          <div className="h-2 w-14 bg-[#E5E2DC] rounded-full mt-2" />
        </div>
      </div>
      <div className="space-y-2.5">
        <div className="h-9 bg-[#F5F0E8] rounded-lg flex items-center px-3">
          <span className="text-[11px] text-[#8A8578] font-body">Email address</span>
        </div>
        <div className="h-9 bg-[#F5F0E8] rounded-lg flex items-center px-3">
          <span className="text-[11px] text-[#8A8578] font-body">Password</span>
        </div>
        <div className="h-9 bg-[#0a5dc2] rounded-lg flex items-center justify-center">
          <span className="text-[11px] text-white font-body font-medium">Create account</span>
        </div>
      </div>
    </div>
  );
}

function VideoCallVisual() {
  return (
    <div className="bg-[#1a1d24] rounded-2xl shadow-xl p-5 w-full max-w-xs">
      <div className="aspect-video bg-[#252a33] rounded-lg flex items-center justify-center mb-3 relative">
        <div className="w-14 h-14 rounded-full bg-[#0a5dc2]/30 flex items-center justify-center">
          <User className="w-7 h-7 text-[#0a5dc2]" strokeWidth={1.5} />
        </div>
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span className="text-[9px] text-white/70 font-body">Connected</span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
          <Video className="w-4 h-4 text-white" strokeWidth={1.5} />
        </div>
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
          <User className="w-4 h-4 text-white" strokeWidth={1.5} />
        </div>
        <div className="h-8 px-4 rounded-full bg-[#dc2626] flex items-center justify-center">
          <span className="text-[10px] text-white font-body font-medium">End</span>
        </div>
      </div>
    </div>
  );
}

const VISUALS = [AttorneyVisual, CalendarVisual, AccountVisual, VideoCallVisual];

/* ---------- Main component ---------- */

export default function HowBriefWorks() {
  const { t } = useLanguage();
  const [reduced, setReduced] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Step-list opacity: active = 1, inactive = 0.35
  const listOp0 = useTransform(scrollYProgress, [0, 0.22, 0.28], [1, 1, 0.35]);
  const listOp1 = useTransform(scrollYProgress, [0.22, 0.28, 0.47, 0.53], [0.35, 1, 1, 0.35]);
  const listOp2 = useTransform(scrollYProgress, [0.47, 0.53, 0.72, 0.78], [0.35, 1, 1, 0.35]);
  const listOp3 = useTransform(scrollYProgress, [0.72, 0.78, 1], [0.35, 1, 1]);

  // Visual opacity: active = 1, inactive = 0
  const visOp0 = useTransform(scrollYProgress, [0, 0.22, 0.28], [1, 1, 0]);
  const visOp1 = useTransform(scrollYProgress, [0.22, 0.28, 0.47, 0.53], [0, 1, 1, 0]);
  const visOp2 = useTransform(scrollYProgress, [0.47, 0.53, 0.72, 0.78], [0, 1, 1, 0]);
  const visOp3 = useTransform(scrollYProgress, [0.72, 0.78, 1], [0, 1, 1]);

  // Visual x slide (GPU transform only)
  const visX0 = useTransform(scrollYProgress, [0.22, 0.28], [0, -40]);
  const visX1 = useTransform(scrollYProgress, [0.22, 0.28, 0.47, 0.53], [40, 0, 0, -40]);
  const visX2 = useTransform(scrollYProgress, [0.47, 0.53, 0.72, 0.78], [40, 0, 0, -40]);
  const visX3 = useTransform(scrollYProgress, [0.72, 0.78], [40, 0]);

  const listOps = [listOp0, listOp1, listOp2, listOp3];
  const visOps = [visOp0, visOp1, visOp2, visOp3];
  const visXs = [visX0, visX1, visX2, visX3];

  /* ----- Reduced-motion: static grid, no pinning ----- */
  if (reduced) {
    return (
      <section className="bg-[#EAF2FB] py-20 lg:py-28 px-6 lg:px-8">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif font-medium text-[28px] lg:text-[38px] text-[#111418] leading-[1.1]">How Brief works</h2>
            <p className="text-[#8A8578] font-body mt-3">Four simple steps from search to consultation.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {STEPS.map((step, i) => (
              <div key={step.key} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
                  <span className="font-body font-bold text-[24px] text-[#0a5dc2] leading-none">{step.num}</span>
                </div>
                <h3 className="font-serif font-medium text-[17px] text-[#111418] mb-2">{t(`howBrief.${step.key}.title`)}</h3>
                <p className="text-[13px] text-[#8A8578] font-body leading-snug max-w-[220px]">{t(`howBrief.${step.key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* ----- Pinned scroll-scrub ----- */
  return (
    <section ref={containerRef} className="relative bg-[#EAF2FB] h-[400svh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden flex flex-col justify-center px-6 lg:px-8 pt-20 lg:pt-24 pb-8">
        <div className="max-w-[1100px] mx-auto w-full flex flex-col items-center">
          {/* Heading */}
          <div className="text-center mb-8 lg:mb-12 shrink-0">
            <h2 className="font-serif font-medium text-[28px] lg:text-[38px] text-[#111418] leading-[1.1]">How Brief works</h2>
            <p className="text-[#8A8578] font-body mt-3">Four simple steps from search to consultation.</p>
          </div>

          {/* Content */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-16 w-full">
            {/* Step list */}
            <div className="flex lg:flex-col gap-2 lg:gap-3 justify-center shrink-0">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.key}
                  style={{ opacity: listOps[i] }}
                  className="flex items-center gap-3 lg:gap-4"
                >
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <span className="font-body font-bold text-[18px] lg:text-[20px] text-[#0a5dc2] leading-none">{step.num}</span>
                  </div>
                  <div className="hidden lg:block">
                    <h3 className="font-serif font-medium text-[16px] text-[#111418]">{t(`howBrief.${step.key}.title`)}</h3>
                    <p className="text-[13px] text-[#8A8578] font-body leading-snug">{t(`howBrief.${step.key}.desc`)}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Mobile: active step title */}
            <div className="lg:hidden relative h-10 w-full max-w-xs">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.key}
                  style={{ opacity: visOps[i] }}
                  className="absolute inset-0 text-center"
                >
                  <h3 className="font-serif font-medium text-[15px] text-[#111418]">{t(`howBrief.${step.key}.title`)}</h3>
                  <p className="text-[12px] text-[#8A8578] font-body leading-snug">{t(`howBrief.${step.key}.desc`)}</p>
                </motion.div>
              ))}
            </div>

            {/* Visual cards */}
            <div className="relative w-full max-w-xs lg:max-w-sm h-[260px] lg:h-[320px]">
              {VISUALS.map((Visual, i) => (
                <motion.div
                  key={i}
                  style={{ opacity: visOps[i], x: visXs[i] }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Visual />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
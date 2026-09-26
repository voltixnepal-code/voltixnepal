import React from 'react';
import { Star, ExternalLink, CheckCircle2, MessageSquareHeart } from 'lucide-react';

interface TrustpilotBannerProps {
  reviewUrl?: string;
}

export default function TrustpilotBanner({
  reviewUrl = 'https://www.trustpilot.com/evaluate/voltixnepal.com',
}: TrustpilotBannerProps) {
  const profileUrl = 'https://www.trustpilot.com/review/voltixnepal.com';

  return (
    <section className="w-full bg-slate-900 text-white py-10 sm:py-14 border-y border-slate-800 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00b67a]/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full px-4 sm:px-6 lg:px-10 relative z-10">
        <div className="max-w-5xl mx-auto bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          
          {/* Left Content: Trustpilot Badge, Heading & Highlights */}
          <div className="space-y-3.5 text-center md:text-left flex-1">
            {/* Trustpilot Green 5-Star Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00b67a]/15 border border-[#00b67a]/40 text-[#00b67a] text-xs font-bold shadow-xs">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-[#00b67a] flex items-center justify-center rounded-xs shadow-xs">
                    <Star className="w-3 h-3 fill-white text-white stroke-0" />
                  </div>
                ))}
              </div>
              <span className="text-white font-black text-xs ml-1">5.0 / 5.0</span>
              <span className="text-slate-300 font-medium">• Trustpilot Reviews</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Satisfied with Voltix Nepal&apos;s Electrical Work?
            </h3>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl font-normal leading-relaxed">
              Your review helps homeowners and businesses in Kathmandu Valley choose certified, safe, and punctual electrical services. Rate your experience directly on our verified Trustpilot page!
            </p>

            {/* Quick value props */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1 text-xs font-medium text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00b67a] shrink-0" />
                Takes only 1 minute
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00b67a] shrink-0" />
                Verified customer reviews
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00b67a] shrink-0" />
                Direct review for Sanjit Mishra
              </span>
            </div>
          </div>

          {/* Right Column: CTA Buttons */}
          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col items-center gap-3 w-full md:w-auto pt-2 md:pt-0">
            <a
              href={reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#00b67a] hover:bg-[#00a36c] text-white font-extrabold text-sm sm:text-base transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#00b67a]/30 text-center whitespace-nowrap"
            >
              <Star className="w-4 h-4 fill-white text-white" />
              <span>Write a Review on Trustpilot</span>
              <ExternalLink className="w-4 h-4 text-emerald-100" />
            </a>

            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors underline flex items-center gap-1.5 py-1"
            >
              <MessageSquareHeart className="w-3.5 h-3.5 text-[#00b67a]" />
              <span>Read all customer reviews on Trustpilot</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}


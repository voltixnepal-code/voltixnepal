import React from 'react';
import Image from 'next/image';
import { Star, ExternalLink, CheckCircle2, MessageSquareHeart, ShieldCheck } from 'lucide-react';

interface TrustpilotBannerProps {
  reviewUrl?: string;
}

export default function TrustpilotBanner({
  reviewUrl = 'https://www.trustpilot.com/evaluate/voltixnepal.com',
}: TrustpilotBannerProps) {
  const profileUrl = 'https://www.trustpilot.com/review/voltixnepal.com';

  return (
    <section className="w-full bg-gradient-to-b from-white via-slate-50 to-emerald-50/30 py-12 md:py-16 border-y border-slate-200 relative overflow-hidden">
      {/* Light subtle green & red accent ambient glows */}
      <div className="absolute -top-24 right-10 w-96 h-96 bg-[#00b67a]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-10 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full px-4 sm:px-6 lg:px-10 relative z-10">
        <div className="max-w-6xl mx-auto bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl shadow-slate-200/60 relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-4 text-center md:text-left">
              
              {/* Trustpilot Green 5-Star Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00b67a]/10 border border-[#00b67a]/30 text-[#00b67a] text-xs font-bold shadow-xs">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-[#00b67a] flex items-center justify-center rounded-xs">
                      <Star className="w-2.5 h-2.5 fill-white text-white stroke-0" />
                    </div>
                  ))}
                </div>
                <span className="text-slate-900 font-extrabold text-xs ml-1">5.0 / 5.0</span>
                <span className="text-slate-500 font-medium">• Verified Trustpilot Reviews</span>
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-red-600 mb-1 flex items-center justify-center md:justify-start gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-red-600" />
                  <span>Customer Feedback & Safety Assurance</span>
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  Satisfied with Voltix Nepal&apos;s Electrical Work?
                </h3>
              </div>

              <p className="text-sm sm:text-base text-slate-600 max-w-2xl font-normal leading-relaxed">
                Your review helps homeowners and commercial property owners across Kathmandu Valley choose certified, safe, and punctual electrical services. Rate your experience directly on our verified Trustpilot page!
              </p>

              {/* Quick Trust Highlights */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1 text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-[#00b67a] shrink-0" />
                  Takes less than 1 minute
                </span>
                <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-[#00b67a] shrink-0" />
                  No login hassle
                </span>
                <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-[#00b67a] shrink-0" />
                  Direct review for Sanjit Mishra
                </span>
              </div>

              {/* CTA Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3.5">
                <a
                  href={reviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#00b67a] hover:bg-[#00a36c] text-white font-extrabold text-sm sm:text-base transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#00b67a]/25 text-center whitespace-nowrap"
                >
                  <Star className="w-4 h-4 fill-white text-white" />
                  <span>Write a Review on Trustpilot</span>
                  <ExternalLink className="w-4 h-4 text-emerald-100" />
                </a>

                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors text-center border border-slate-200"
                >
                  <MessageSquareHeart className="w-4 h-4 text-[#00b67a]" />
                  <span>Read Verified Reviews</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>

            </div>

            {/* Right Image Feature Column */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xl bg-white max-w-sm sm:max-w-md w-full transform hover:scale-[1.01] transition-transform duration-300">
                
                {/* Image display */}
                <div className="relative aspect-square w-full bg-slate-100">
                  <Image
                    src="/trustpilot-banner-img.jpg"
                    alt="Leave Us A Review & Follow Us Online - Voltix Nepal"
                    fill
                    className="object-cover rounded-2xl"
                    priority
                  />
                </div>

                {/* Bottom Overlay Label */}
                <div className="p-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between gap-2 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#00b67a] rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-slate-100">Official Trustpilot Partner</span>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-400">voltixnepal.com</span>
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}



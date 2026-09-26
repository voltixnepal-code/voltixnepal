import React from 'react';
import Image from 'next/image';
import { Star, ExternalLink, MessageSquare } from 'lucide-react';

interface TrustpilotBannerProps {
  reviewUrl?: string;
}

export default function TrustpilotBanner({
  reviewUrl = 'https://www.trustpilot.com/evaluate/voltixnepal.com',
}: TrustpilotBannerProps) {
  const profileUrl = 'https://www.trustpilot.com/review/voltixnepal.com';

  return (
    <section className="w-full bg-slate-50 border-y border-slate-200 py-12 md:py-16">
      <div className="w-full px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Content Column */}
          <div className="lg:col-span-7 space-y-4 text-center md:text-left">
            
            {/* Trustpilot 5 Green Stars Row */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-6 h-6 bg-[#00b67a] flex items-center justify-center rounded-xs shadow-xs">
                    <Star className="w-4 h-4 fill-white text-white stroke-0" />
                  </div>
                ))}
              </div>
              <span className="text-slate-900 font-extrabold text-base ml-1">5.0 / 5.0</span>
              <span className="text-slate-500 text-sm font-medium">• Verified Customer Feedback</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Have We Completed Electrical Work for You?
            </h2>

            <p className="text-base text-slate-700 leading-relaxed max-w-2xl font-normal">
              Your honest review helps homeowners and business owners across Kathmandu Valley find certified, reliable, and punctual electrical services. Please take a minute to rate your experience with Sanjit Mishra on Trustpilot.
            </p>

            {/* CTAs */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
              <a
                href={reviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#00b67a] hover:bg-[#00a36c] text-white font-bold text-sm sm:text-base transition-colors shadow-md text-center"
              >
                <Star className="w-4 h-4 fill-white text-white" />
                <span>Write a Review on Trustpilot</span>
                <ExternalLink className="w-4 h-4 text-emerald-100" />
              </a>

              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-semibold text-sm transition-colors border border-slate-300 shadow-xs"
              >
                <MessageSquare className="w-4 h-4 text-[#00b67a]" />
                <span>View All Reviews</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
            </div>

          </div>

          {/* Right Image Feature Column */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-white max-w-md w-full">
              <div className="relative aspect-square w-full bg-slate-100">
                <Image
                  src="/trustpilot-banner-img.jpg"
                  alt="Leave Us A Review & Follow Us Online - Voltix Nepal"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}




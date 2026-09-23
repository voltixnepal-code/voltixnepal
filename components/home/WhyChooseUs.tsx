import React from 'react';
import { ShieldCheck, Clock, CheckCircle2, Wrench } from 'lucide-react';

export default function WhyChooseUs() {
  const points = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-red-600" />,
      title: 'Safety First & Code Compliance',
      description:
        'Every circuit, earthing pit, and breaker installation is rigorously tested using calibrated multimeters and insulation testers to prevent electrical hazards.',
    },
    {
      icon: <Clock className="w-6 h-6 text-red-600" />,
      title: 'Punctual & Rapid Response',
      description:
        'We value your time. For emergency breakdown calls in Kathmandu Valley, our technician prioritizes rapid dispatch to resolve power cuts without delay.',
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-red-600" />,
      title: 'Transparent Pricing & Estimates',
      description:
        'No hidden costs or surprise surcharges. We inspect the problem and explain the exact repair or installation quote before picking up our tools.',
    },
    {
      icon: <Wrench className="w-6 h-6 text-red-600" />,
      title: 'Certified Heavy-Duty Spares',
      description:
        'We use only genuine, flame-retardant copper wiring, ISI/NS-certified MCBs, and durable switchgear from trusted manufacturers.',
    },
  ];

  return (
    <section className="py-14 md:py-20 bg-white w-full">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            High Standards of Workmanship & Safety
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Trusted electrical contractor services built on transparency, technical competence, and reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {points.map((pt, idx) => (
            <div
              key={idx}
              className="p-6 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition-colors shadow-xs"
            >
              <div className="w-12 h-12 rounded-md bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-xs">
                {pt.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {pt.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {pt.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

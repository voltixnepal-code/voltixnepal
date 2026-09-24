import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import {
  ShieldCheck,
  Wrench,
  CheckCircle2,
  Phone,
  CalendarCheck,
  Zap,
  Award,
  Clock,
  Building,
  Users,
  Target,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { Metadata } from 'next';
import { DEFAULT_SETTINGS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'About Sanjit Mishra & VoltixNepal | Certified Electrical Services',
  description:
    'Learn about Sanjit Mishra, lead electrical contractor in Kathmandu Valley. Certified wiring, safety standards, inverter backups, and emergency electrical troubleshooting.',
};

export const revalidate = 0;

export default async function AboutPage() {
  let settings = DEFAULT_SETTINGS as any;

  try {
    const dbSettings = await prisma.websiteSettings.findUnique({
      where: { id: 'default_settings' },
    });
    if (dbSettings) settings = { ...DEFAULT_SETTINGS, ...dbSettings };
  } catch (err) {
    console.warn('Using default settings in About page:', err);
  }

  const ownerName = settings?.ownerName || 'Sanjit Mishra';
  const ownerTitle = settings?.aboutOwnerTitle || 'Lead Electrician & Proprietor';
  const ownerBio = settings?.aboutOwnerBio || 'Certified lead electrician with over 10 years of hands-on expertise in domestic wiring, DB panel design, commercial automation, and certified earthing.';
  const ownerPhoto = settings?.aboutOwnerPhoto || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80';
  const coverPhoto = settings?.aboutCoverPhoto || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80';
  
  const aboutTitle = settings?.aboutTitle || 'Reliable Electrical Workmanship with Safety at the Core';
  const aboutSubtitle = settings?.aboutSubtitle || 'Standardized safety, transparent diagnostics, and punctual technician dispatch across Kathmandu Valley.';
  const aboutStory = settings?.aboutStory || `VoltixNepal was founded by ${ownerName} to address a persistent issue in the Kathmandu Valley electrical contracting space: the lack of standardized safety, transparent diagnostics, and punctual technician dispatch.`;
  const aboutMission = settings?.aboutMission || 'Protecting lives, eliminating electrical fire hazards, and ensuring home appliances function safely without voltage drop or insulation failure.';
  const aboutVision = settings?.aboutVision || "To be Nepal's leading safety-first electrical service engineering firm for residential and commercial infrastructure.";
  
  const experienceYears = settings?.aboutExperienceYears ?? 10;
  const projectsDone = settings?.aboutProjectsDone ?? 1500;
  const happyClients = settings?.aboutHappyClients ?? 1200;
  const businessPhone = settings?.phone || '+977 9825870047';
  const whatsappNumber = settings?.whatsappNumber || '9779825870047';

  return (
    <div className="bg-white min-h-screen py-10 md:py-16 w-full">
      <div className="w-full px-4 sm:px-8 lg:px-12 2xl:px-16 space-y-16">
        {/* Top Intro Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              {aboutTitle}
            </h1>

            <p className="text-base sm:text-lg text-red-600 font-semibold leading-relaxed">
              {aboutSubtitle}
            </p>

            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {aboutStory}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/request-service"
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <span>Request Service Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={`tel:${businessPhone.replace(/\s+/g, '')}`}
                className="px-5 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs transition-colors flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-red-600" />
                <span>Call {businessPhone}</span>
              </a>

              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                  `Hello Sanjit, I would like to inquire about VoltixNepal electrical contracting services.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Owner Profile Card */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900 group">
              <img
                src={ownerPhoto}
                alt={ownerName}
                className="object-cover w-full h-[440px] group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6 text-white space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold">{ownerName}</div>
                    <div className="text-xs text-red-400 font-semibold">{ownerTitle}</div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/80 backdrop-blur-xs text-xs font-bold text-white shadow-sm border border-red-400/30">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>VoltixNepal</span>
                  </div>
                </div>

                {ownerBio && (
                  <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-white/10 line-clamp-3">
                    {ownerBio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Achievements / Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 text-center space-y-2 shadow-2xs hover:shadow-md transition-shadow">
            <Clock className="w-8 h-8 text-red-600 mx-auto" />
            <div className="text-3xl sm:text-4xl font-black text-slate-900">{experienceYears}+</div>
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">Years of Field Experience</div>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 text-center space-y-2 shadow-2xs hover:shadow-md transition-shadow">
            <Building className="w-8 h-8 text-blue-600 mx-auto" />
            <div className="text-3xl sm:text-4xl font-black text-slate-900">{projectsDone}+</div>
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">Completed Installations</div>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 text-center space-y-2 shadow-2xs hover:shadow-md transition-shadow">
            <Users className="w-8 h-8 text-emerald-600 mx-auto" />
            <div className="text-3xl sm:text-4xl font-black text-slate-900">{happyClients}+</div>
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">Satisfied Clients</div>
          </div>
        </div>

        {/* Mission & Vision Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50 space-y-4 flex flex-col justify-between shadow-2xs">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-bold">
                <Target className="w-3.5 h-3.5" />
                <span>Our Mission</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Dedicated to Life Safety & Fire Prevention</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {aboutMission}
              </p>
            </div>
          </div>

          <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50 space-y-4 flex flex-col justify-between shadow-2xs">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold">
                <Award className="w-3.5 h-3.5" />
                <span>Our Vision</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Setting the Industry Benchmark for Nepal</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {aboutVision}
              </p>
            </div>
          </div>
        </div>

        {/* Core Working Principles */}
        <div className="border-t border-slate-200 pt-14">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Our Core Service Standards
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Every job, from a simple switch replacement to a multi-story commercial building, is executed with strict engineering discipline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Precision Diagnostic Tools
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We test insulation resistance, earth loop impedance, and true RMS voltage before and after any repair to verify that the fault is 100% eliminated.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Genuine Certified Materials
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We advocate for ISI/NS certified flame-retardant copper conductors, properly rated MCB/RCCB breakers, and heavy-duty brass terminal sockets.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Punctual & Direct Communication
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                No third-party call centers or middlemen. You speak directly with the electrician who will diagnose and repair your system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

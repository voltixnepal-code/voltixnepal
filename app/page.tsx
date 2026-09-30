import React from 'react';
import prisma from '@/lib/prisma';
import HeroSlider from '@/components/home/HeroSlider';
import EmergencyBanner from '@/components/layout/EmergencyBanner';
import ServicesGrid from '@/components/home/ServicesGrid';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import AboutSnippet from '@/components/home/AboutSnippet';
import TrustpilotBanner from '@/components/home/TrustpilotBanner';
import TestimonialSection from '@/components/home/TestimonialSection';
import FaqAccordion from '@/components/home/FaqAccordion';
import BlogSnippet from '@/components/home/BlogSnippet';
import CtaBanner from '@/components/home/CtaBanner';
import {
  DEFAULT_HERO_SLIDES,
  DEFAULT_SERVICES,
  DEFAULT_TESTIMONIALS,
  DEFAULT_FAQS,
  DEFAULT_BLOG_POSTS,
} from '@/lib/default-data';
import { DEFAULT_SETTINGS } from '@/lib/constants';

export const revalidate = 0; // Dynamic server rendering

const DEFAULT_SECTION_ORDER = [
  { sectionKey: 'hero', isEnabled: true, sortOrder: 1 },
  { sectionKey: 'emergency_banner', isEnabled: true, sortOrder: 2 },
  { sectionKey: 'services', isEnabled: true, sortOrder: 3 },
  { sectionKey: 'why_choose_us', isEnabled: true, sortOrder: 4 },
  { sectionKey: 'about', isEnabled: true, sortOrder: 5 },
  { sectionKey: 'testimonials', isEnabled: true, sortOrder: 6 },
  { sectionKey: 'faq', isEnabled: true, sortOrder: 7 },
  { sectionKey: 'blog', isEnabled: true, sortOrder: 8 },
  { sectionKey: 'cta', isEnabled: true, sortOrder: 9 },
];

export default async function HomePage() {
  let heroSlides = DEFAULT_HERO_SLIDES as any[];
  let services = DEFAULT_SERVICES as any[];
  let testimonials = DEFAULT_TESTIMONIALS as any[];
  let faqs = DEFAULT_FAQS as any[];
  let blogPosts = DEFAULT_BLOG_POSTS as any[];
  let settings = DEFAULT_SETTINGS as any;
  let sections = DEFAULT_SECTION_ORDER as any[];

  try {
    const [dbSlides, dbServices, dbTestimonials, dbFaqs, dbBlogPosts, dbSettings, dbSections] =
      await Promise.all([
        prisma.heroSlide.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        }).catch(() => []),
        prisma.service.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        }).catch(() => []),
        prisma.testimonial.findMany({
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
          take: 4,
        }).catch(() => []),
        prisma.faq.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          take: 6,
        }).catch(() => []),
        prisma.blogPost.findMany({
          where: { isPublished: true },
          orderBy: { publishedAt: 'desc' },
          take: 3,
        }).catch(() => []),
        prisma.websiteSettings.findUnique({
          where: { id: 'default_settings' },
        }).catch(() => null),
        prisma.homepageSection.findMany({
          orderBy: { sortOrder: 'asc' },
        }).catch(() => []),
      ]);

    if (dbSlides && dbSlides.length > 0) heroSlides = dbSlides;
    if (dbServices && dbServices.length > 0) services = dbServices;
    if (dbTestimonials && dbTestimonials.length > 0) testimonials = dbTestimonials;
    if (dbFaqs && dbFaqs.length > 0) faqs = dbFaqs;
    if (dbBlogPosts && dbBlogPosts.length > 0) blogPosts = dbBlogPosts;
    if (dbSettings) settings = dbSettings;
    if (dbSections && dbSections.length > 0) sections = dbSections;
  } catch (err) {
    console.warn('Using fallback data due to initial DB setup:', err);
  }

  // Render a specific section based on key
  const renderSection = (key: string) => {
    switch (key) {
      case 'hero':
        return <HeroSlider key="hero" slides={heroSlides} />;

      case 'emergency_banner':
        return (
          <EmergencyBanner
            key="emergency_banner"
            phone={settings?.emergencyPhone || settings?.phone}
            announcement={settings?.announcementText}
            active={settings?.announcementActive}
          />
        );

      case 'services':
        return <ServicesGrid key="services" services={services} />;

      case 'why_choose_us':
        return <WhyChooseUs key="why_choose_us" />;

      case 'about':
      case 'about_snippet':
        return (
          <React.Fragment key="about">
            <AboutSnippet
              settings={{
                ownerName:        settings?.ownerName,
                phone:            settings?.phone,
                whatsappNumber:   settings?.whatsappNumber,
                aboutOwnerPhoto:  settings?.aboutOwnerPhoto,
                aboutOwnerTitle:  settings?.aboutOwnerTitle,
                aboutHeadline:    settings?.aboutHeadline,
                aboutBio1:        settings?.aboutBio1,
                aboutBio2:        settings?.aboutBio2,
                aboutHighlights:  settings?.aboutHighlights,
                aboutBookBtnText: settings?.aboutBookBtnText,
              }}
            />
            <TrustpilotBanner />
          </React.Fragment>
        );

      case 'testimonials':
        return <TestimonialSection key="testimonials" testimonials={testimonials} />;

      case 'faq':
        return <FaqAccordion key="faq" faqs={faqs} />;

      case 'blog':
        return <BlogSnippet key="blog" posts={blogPosts} />;

      case 'cta':
        return (
          <CtaBanner
            key="cta"
            phone={settings?.phone}
            whatsappNumber={settings?.whatsappNumber}
          />
        );

      default:
        return null;
    }
  };

  const sortedEnabledSections = [...sections]
    .filter((sec) => sec.isEnabled !== false)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return (
    <div>
      {sortedEnabledSections.map((sec) => renderSection(sec.sectionKey))}
    </div>
  );
}

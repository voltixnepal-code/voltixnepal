import React from 'react';
import prisma from '@/lib/prisma';
import HeroSlider from '@/components/home/HeroSlider';
import ServicesGrid from '@/components/home/ServicesGrid';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import AboutSnippet from '@/components/home/AboutSnippet';
import TrustpilotBanner from '@/components/home/TrustpilotBanner';
import TestimonialSection from '@/components/home/TestimonialSection';
import FaqAccordion from '@/components/home/FaqAccordion';
import BlogSnippet from '@/components/home/BlogSnippet';
import {
  DEFAULT_HERO_SLIDES,
  DEFAULT_SERVICES,
  DEFAULT_TESTIMONIALS,
  DEFAULT_FAQS,
  DEFAULT_BLOG_POSTS,
} from '@/lib/default-data';
import { DEFAULT_SETTINGS } from '@/lib/constants';

export const revalidate = 0; // Dynamic server rendering

export default async function HomePage() {
  let heroSlides = DEFAULT_HERO_SLIDES as any[];
  let services = DEFAULT_SERVICES as any[];
  let testimonials = DEFAULT_TESTIMONIALS as any[];
  let faqs = DEFAULT_FAQS as any[];
  let blogPosts = DEFAULT_BLOG_POSTS as any[];
  let settings = DEFAULT_SETTINGS as any;

  try {
    const [dbSlides, dbServices, dbTestimonials, dbFaqs, dbBlogPosts, dbSettings] =
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
      ]);

    if (dbSlides && dbSlides.length > 0) heroSlides = dbSlides;
    if (dbServices && dbServices.length > 0) services = dbServices;
    if (dbTestimonials && dbTestimonials.length > 0) testimonials = dbTestimonials;
    if (dbFaqs && dbFaqs.length > 0) faqs = dbFaqs;
    if (dbBlogPosts && dbBlogPosts.length > 0) blogPosts = dbBlogPosts;
    if (dbSettings) settings = dbSettings;
  } catch (err) {
    console.warn('Using fallback data due to initial DB setup:', err);
  }

  return (
    <div>
      <HeroSlider slides={heroSlides} />
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
      <ServicesGrid services={services} />
      <WhyChooseUs />
      <TestimonialSection testimonials={testimonials} />
      <BlogSnippet posts={blogPosts} />
      <FaqAccordion faqs={faqs} />
    </div>
  );
}


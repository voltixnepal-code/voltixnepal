import React from 'react';
import prisma from '@/lib/prisma';
import HeroSlider from '@/components/home/HeroSlider';
import ServicesGrid from '@/components/home/ServicesGrid';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import AboutSnippet from '@/components/home/AboutSnippet';
import TestimonialSection from '@/components/home/TestimonialSection';
import FaqAccordion from '@/components/home/FaqAccordion';
import BlogSnippet from '@/components/home/BlogSnippet';
import CtaBanner from '@/components/home/CtaBanner';

export const revalidate = 0; // Dynamic server rendering

export default async function HomePage() {
  // Fetch data in parallel
  const [
    heroSlides,
    services,
    testimonials,
    faqs,
    blogPosts,
    sections,
    settings,
  ] = await Promise.all([
    prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.testimonial.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: 'desc' },
      take: 4,
    }),
    prisma.faq.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      take: 6,
    }),
    prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      take: 3,
    }),
    prisma.homepageSection.findMany({
      where: { isEnabled: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.websiteSettings.findUnique({
      where: { id: 'default_settings' },
    }),
  ]);

  // Map section keys to components
  const sectionMap: Record<string, React.ReactNode> = {
    hero: <HeroSlider key="hero" slides={heroSlides} />,
    services: <ServicesGrid key="services" services={services} />,
    why_choose_us: <WhyChooseUs key="why_choose_us" />,
    about: (
      <AboutSnippet
        key="about"
        settings={{
          ownerName: settings?.ownerName,
          phone: settings?.phone,
          whatsappNumber: settings?.whatsappNumber,
        }}
      />
    ),
    testimonials: (
      <TestimonialSection key="testimonials" testimonials={testimonials} />
    ),
    faq: <FaqAccordion key="faq" faqs={faqs} />,
    blog: <BlogSnippet key="blog" posts={blogPosts} />,
    cta: (
      <CtaBanner
        key="cta"
        phone={settings?.phone}
        whatsappNumber={settings?.whatsappNumber}
      />
    ),
  };

  // If sections exist, render in customized order; otherwise render default flow
  return (
    <div>
      {sections.length > 0
        ? sections
            .map((sec) => sectionMap[sec.sectionKey])
            .filter(Boolean)
        : Object.values(sectionMap)}
    </div>
  );
}

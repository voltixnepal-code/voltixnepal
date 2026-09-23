import React from 'react';
import prisma from '@/lib/prisma';
import FaqAccordion from '@/components/home/FaqAccordion';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | VoltixNepal',
  description:
    'Answers to common electrical questions: emergency response times in Kathmandu, house wiring estimates, materials, and safety.',
};

export const revalidate = 0;

export default async function FaqPage() {
  const faqs = await prisma.faq.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <div className="bg-slate-50 min-h-screen py-10 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FaqAccordion faqs={faqs} />
      </div>
    </div>
  );
}

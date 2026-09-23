const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updatePhone() {
  await prisma.websiteSettings.updateMany({
    data: {
      phone: '+977 9825870047',
      whatsappNumber: '9779825870047',
      emergencyPhone: '+977 9825870047',
    },
  });

  await prisma.heroSlide.updateMany({
    where: { secondaryBtnLink: { contains: '9800000000' } },
    data: {
      secondaryBtnLink: 'tel:+9779825870047',
    },
  });

  await prisma.heroSlide.updateMany({
    where: { secondaryBtnLink: { contains: 'wa.me' } },
    data: {
      secondaryBtnLink: 'https://wa.me/9779825870047?text=Hello%20VoltixNepal,%20I%20have%20an%20urgent%20electrical%20issue.',
    },
  });

  console.log('Database successfully updated with phone +977 9825870047 and WhatsApp 9779825870047');
}

updatePhone()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

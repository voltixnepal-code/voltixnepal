import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding VoltixNepal database...');

  // 1. Website Settings
  await prisma.websiteSettings.upsert({
    where: { id: 'default_settings' },
    update: {},
    create: {
      id: 'default_settings',
      businessName: 'VoltixNepal',
      ownerName: 'Sanjit Mishra',
      tagline: 'Professional Electrical Services in Nepal',
      phone: '+977 9825870047',
      whatsappNumber: '9779825870047',
      email: 'sanjit@voltixnepal.com',
      address: 'Kathmandu, Bagmati Province, Nepal',
      businessHours: 'Sunday - Friday: 7:00 AM - 8:00 PM | Saturday: Emergency Only',
      emergencyAvailable: true,
      emergencyPhone: '+977 9825870047',
      googleMapsUrl: 'https://maps.google.com/?q=Kathmandu,Nepal',
      footerText: 'Professional electrical installation, emergency repair, and maintenance services across Kathmandu Valley. Safety, punctuality, and quality guaranteed by Sanjit Mishra.',
      announcementText: '24/7 Emergency Electrical Breakdown Service Active across Kathmandu, Lalitpur & Bhaktapur.',
      announcementActive: true,
      facebookUrl: 'https://facebook.com/voltixnepal',
      instagramUrl: 'https://instagram.com/voltixnepal',
      tiktokUrl: 'https://tiktok.com/@voltixnepal',
      youtubeUrl: 'https://youtube.com',
    },
  });

  // 2. 5 Hero Slides (Realistic imagery & copy)
  const slides = [
    {
      badge: 'CERTIFIED ELECTRICAL SERVICES',
      title: 'Reliable Electrical Services for Your Home & Business',
      description: 'Professional electrical installation, wiring, troubleshooting, and maintenance services across Kathmandu Valley with guaranteed safety standards.',
      primaryBtnText: 'Request a Service',
      primaryBtnLink: '/request-service',
      secondaryBtnText: 'Call Now',
      secondaryBtnLink: 'tel:+9779825870047',
      imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1600&q=80',
      isActive: true,
      sortOrder: 1,
    },
    {
      badge: '24/7 EMERGENCY ASSISTANCE',
      title: 'Emergency Electrical Breakdown & Short Circuit Repair',
      description: 'Sudden power outages, tripping MCBs, burning smells, or dangerous sparks resolved quickly and safely by experienced technicians.',
      primaryBtnText: 'Emergency Request',
      primaryBtnLink: '/request-service?urgency=EMERGENCY',
      secondaryBtnText: 'WhatsApp Chat',
      secondaryBtnLink: 'https://wa.me/9779825870047?text=Hello%20VoltixNepal,%20I%20have%20an%20urgent%20electrical%20issue.',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80',
      isActive: true,
      sortOrder: 2,
    },
    {
      badge: 'RESIDENTIAL & COMMERCIAL',
      title: 'Complete House Wiring & Distribution Board Installation',
      description: 'Conduit piping, load-balanced distribution boards, earthing systems, and premium concealed wiring for new constructions and renovations.',
      primaryBtnText: 'Book Inspection',
      primaryBtnLink: '/request-service',
      secondaryBtnText: 'View Services',
      secondaryBtnLink: '/services',
      imageUrl: 'https://images.unsplash.com/photo-1544725121-be3bf52e2dc8?auto=format&fit=crop&w=1600&q=80',
      isActive: true,
      sortOrder: 3,
    },
    {
      badge: 'POWER BACKUP EXPERTS',
      title: 'Inverter, Solar & Battery Backup Setup & Maintenance',
      description: 'Professional load calculations, pure sine wave inverter installations, and battery maintenance to keep your home powered seamlessly.',
      primaryBtnText: 'Request Inverter Service',
      primaryBtnLink: '/request-service',
      secondaryBtnText: 'Call Now',
      secondaryBtnLink: 'tel:+9779825870047',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80',
      isActive: true,
      sortOrder: 4,
    },
    {
      badge: 'MODERN FIXTURES & APPLIANCES',
      title: 'Switchboard Upgrades, Lighting & Appliance Connections',
      description: 'Modular switchboards, energy-efficient LED fixtures, heavy appliance connections (geysers, ACs), and preventive safety inspections.',
      primaryBtnText: 'Schedule Service',
      primaryBtnLink: '/request-service',
      secondaryBtnText: 'Learn More',
      secondaryBtnLink: '/about',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1600&q=80',
      isActive: true,
      sortOrder: 5,
    },
  ];

  await prisma.heroSlide.deleteMany({});
  for (const slide of slides) {
    await prisma.heroSlide.create({ data: slide });
  }

  // 3. Realistic Services
  const services = [
    {
      slug: 'house-wiring',
      title: 'Complete House Wiring',
      shortDescription: 'Concealed and open electrical wiring for new homes, flats, and renovation projects.',
      fullDescription: 'We provide end-to-end residential and commercial wiring solutions complying with safe load calculations and high-grade conduit piping. From initial wall chasing to wire pulling and switchboard terminations, every circuit is safely insulated and balanced.',
      category: 'Residential',
      priceDisplay: 'Inspection & Quote on Site',
      imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      iconName: 'Zap',
      benefits: JSON.stringify([
        'Proper circuit load balancing to prevent overloads',
        'Use of ISI/NS certified flame-retardant copper wires',
        'Dedicated circuits for heavy appliances (AC, Geyser, Microwave)',
        'Clean, aesthetic finish with concealed wall conduit',
      ]),
      includedItems: JSON.stringify([
        'Site inspection and electrical blueprint study',
        'Wall cutting, conduit laying, and back box installation',
        'Wire pulling (Phase, Neutral, and Earth)',
        'Continuity and insulation resistance testing',
      ]),
      whenNeeded: JSON.stringify([
        'Building a new residential house or apartment',
        'Full home remodeling or extension',
        'Upgrading old, deteriorating wiring over 15-20 years old',
      ]),
      serviceArea: 'Kathmandu, Lalitpur, Bhaktapur & surrounding areas',
      isActive: true,
      sortOrder: 1,
    },
    {
      slug: 'fault-finding-repair',
      title: 'Short Circuit & Fault Finding',
      shortDescription: 'Fast diagnostic and safe repair for electrical faults, tripping breakers, and sparks.',
      fullDescription: 'Electrical short circuits and hidden faults can cause fire hazards or damage expensive appliances. Using specialized multi-meters and insulation testers, we trace the exact source of circuit breakdowns and fix the issue permanently.',
      category: 'Emergency',
      priceDisplay: 'Diagnostic from Rs. 600',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      iconName: 'AlertTriangle',
      benefits: JSON.stringify([
        'Immediate safety isolation of hazardous lines',
        'Pinpoint fault detection without unnecessary wall damage',
        'Permanent fix to prevent recurring power cuts',
        'Inspection of surrounding wiring to prevent future issues',
      ]),
      includedItems: JSON.stringify([
        'Multimeter & clamp meter diagnostic across all circuits',
        'Checking junction boxes and terminal connections',
        'Replacing burned/damaged wires or components',
        'Full circuit load & safety verification after repair',
      ]),
      whenNeeded: JSON.stringify([
        'Breaker trips repeatedly as soon as it is turned on',
        'Burning smell near switchboards or distribution box',
        'Sparks observed when plugging in appliances',
        'Partial power loss in specific rooms',
      ]),
      serviceArea: 'Kathmandu Valley - Quick Response Available',
      isActive: true,
      sortOrder: 2,
    },
    {
      slug: 'mcb-distribution-board',
      title: 'MCB & Distribution Board Work',
      shortDescription: 'Installation, upgrade, and maintenance of main breaker panels, RCCB, and changeovers.',
      fullDescription: 'The distribution board is the heart of your building electrical safety. We install, organize, and upgrade MCBs (Miniature Circuit Breakers), RCCBs (Earth Leakage Protection), Isolators, and automatic generator/NEA changeover switches.',
      category: 'Residential',
      priceDisplay: 'Starting from Rs. 800',
      imageUrl: 'https://images.unsplash.com/photo-1544725121-be3bf52e2dc8?auto=format&fit=crop&w=800&q=80',
      iconName: 'ShieldCheck',
      benefits: JSON.stringify([
        'Protection against lethal electric shocks (RCCB/ELCB)',
        'Clear labeling of all room circuits for easy identification',
        'Clean, neat cable dressing inside the DB box',
        'Safe changeover mechanism between NEA mains and backup',
      ]),
      includedItems: JSON.stringify([
        'Removal of obsolete or burned fuse units',
        'Mounting modern DIN-rail distribution enclosure',
        'Installing properly rated MCBs based on load',
        'Neutral link, busbar, and earth terminal balancing',
      ]),
      whenNeeded: JSON.stringify([
        'Old porcelain fuse boxes needing modernization',
        'MCB getting overheated or making buzzing sounds',
        'Frequent tripping due to unbalanced load',
        'Adding new AC or heavy load requiring dedicated breaker',
      ]),
      serviceArea: 'All areas in Kathmandu, Lalitpur, and Bhaktapur',
      isActive: true,
      sortOrder: 3,
    },
    {
      slug: 'inverter-battery-installation',
      title: 'Inverter & Battery Setup',
      shortDescription: 'Sizing, installation, rewiring, and maintenance for home inverter backup systems.',
      fullDescription: 'Ensure reliable backup power during unscheduled power cuts. We calculate your home or office wattage needs, wire the dedicated backup circuit, install the inverter unit, and set up deep-cycle batteries with correct safety ventilation.',
      category: 'Installation',
      priceDisplay: 'Installation from Rs. 1,000',
      imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df57046475a?auto=format&fit=crop&w=800&q=80',
      iconName: 'BatteryCharging',
      benefits: JSON.stringify([
        'Optimized load distribution so batteries last longer',
        'Heavy-duty DC cables with crimped copper lugs',
        'Short-circuit and overload protection on output lines',
        'Clean cabling setup with battery stand arrangement',
      ]),
      includedItems: JSON.stringify([
        'Inverter mounting and battery terminal connection',
        'Dedicated inverter line separation from main board',
        'Voltage testing under full backup load',
        'Customer guidance on battery water maintenance',
      ]),
      whenNeeded: JSON.stringify([
        'Installing a new inverter & tubular battery package',
        'Relocating inverter system during room shifting',
        'Backup line failing or not switching seamlessly',
      ]),
      serviceArea: 'Kathmandu Valley',
      isActive: true,
      sortOrder: 4,
    },
    {
      slug: 'switch-socket-installation',
      title: 'Switch & Socket Installation',
      shortDescription: 'Fitting modern modular switches, power sockets, dimmer controls, and USB ports.',
      fullDescription: 'Upgrade outdated switchboards to modern modular designs. We replace broken switches, install heavy 16A power plugs for appliances, and ensure all neutral and grounding terminals are securely screwed to eliminate heating.',
      category: 'Residential',
      priceDisplay: 'Per point rates available',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
      iconName: 'ToggleRight',
      benefits: JSON.stringify([
        'Clean, flush fitting against wall surface',
        'Tight terminal connections preventing internal arcing',
        'Child-safety shutters on power outlets',
        'Aesthetic modernization of your living space',
      ]),
      includedItems: JSON.stringify([
        'Disconnection and safe removal of old plates',
        'Terminal rewiring and insulation verification',
        'Modular grid plate and cover plate mounting',
        'Polarity check (Phase on right, Neutral on left, Earth on top)',
      ]),
      whenNeeded: JSON.stringify([
        'Switches sparking, loose, or stuck',
        'Plugs feeling warm or showing discoloration',
        'Modernizing interior look with modular switch plates',
      ]),
      serviceArea: 'Kathmandu Valley',
      isActive: true,
      sortOrder: 5,
    },
    {
      slug: 'fan-light-installation',
      title: 'Fan & Light Fixture Fitting',
      shortDescription: 'Ceiling fans, exhaust fans, chandeliers, COB spot lights, and LED panels.',
      fullDescription: 'Safe, level, and secure mounting of all residential and commercial lighting fixtures and ventilation fans. We ensure heavy chandeliers and ceiling fans are anchored to concrete ceilings with certified fastener bolts.',
      category: 'Installation',
      priceDisplay: 'Affordable standard rates',
      imageUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80',
      iconName: 'Lightbulb',
      benefits: JSON.stringify([
        'Vibration-free fan rod mounting and balancing',
        'Even light distribution and clean ceiling finish',
        'Proper grounding on all metallic fixtures',
        'Integration with regulator and switch points',
      ]),
      includedItems: JSON.stringify([
        'Fastener drilling and anchor hook fixing',
        'Motor assembly, blade balancing, and down-rod connection',
        'Wiring connection with heat-resistant insulation tape',
        'Operational testing at all speeds/brightness levels',
      ]),
      whenNeeded: JSON.stringify([
        'New ceiling fan or wall fan setup',
        'Replacing incandescent bulbs with false-ceiling LED panels',
        'Installing heavy decorative chandeliers safely',
      ]),
      serviceArea: 'Kathmandu Valley',
      isActive: true,
      sortOrder: 6,
    },
    {
      slug: 'earthing-surge-protection',
      title: 'Earthing & Grounding Systems',
      shortDescription: 'Chemical earthing, copper rod ground pits, and surge protection against lightning.',
      fullDescription: 'Proper earthing protects your life and high-value electronics from leakage currents and lightning surges. We install chemical ground pits, test earth resistance values (Ohms), and bond all metallic body appliances.',
      category: 'Residential',
      priceDisplay: 'Customized based on ground test',
      imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=800&q=80',
      iconName: 'Cpu',
      benefits: JSON.stringify([
        'Prevents tingling shocks from refrigerator, washing machine, or PC',
        'Essential protection for solar and inverter systems',
        'Long-lasting maintenance-free chemical ground compounds',
        'Compliant with safety codes for earth resistance (< 5 Ohms)',
      ]),
      includedItems: JSON.stringify([
        'Earth pit excavation and copper/GI electrode insertion',
        'Backfill compound treatment for optimal conductivity',
        'Earth wire routing to main distribution board busbar',
        'Resistance testing with digital earth tester',
      ]),
      whenNeeded: JSON.stringify([
        'Experiencing electric shocks touching appliances',
        'Building inspection requirement for new homes',
        'Installing solar panels or industrial machinery',
      ]),
      serviceArea: 'Kathmandu, Lalitpur, Bhaktapur',
      isActive: true,
      sortOrder: 7,
    },
    {
      slug: 'commercial-electrical-maintenance',
      title: 'Commercial & Office Maintenance',
      shortDescription: 'Scheduled electrical maintenance for shops, clinics, offices, and restaurants.',
      fullDescription: 'Prevent costly business downtime caused by sudden electrical failures. We conduct preventive maintenance, thermal checks on main distribution boards, emergency lighting tests, and single/three-phase load balancing.',
      category: 'Commercial',
      priceDisplay: 'Monthly / On-demand Contracts',
      imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
      iconName: 'Building2',
      benefits: JSON.stringify([
        'Zero downtime during peak business hours',
        'Scheduled off-hours maintenance visits',
        'Compliance with commercial fire safety standards',
        'Priority emergency response for commercial clients',
      ]),
      includedItems: JSON.stringify([
        'Three-phase voltage and current balance check',
        'Thermal scanning of breaker contacts for loose points',
        'UPS and server room power continuity checks',
        'Maintenance log sheet and improvement recommendations',
      ]),
      whenNeeded: JSON.stringify([
        'Offices with workstations and servers requiring clean power',
        'Retail showrooms and restaurants with continuous lighting loads',
        'Medical clinics needing stable power for equipment',
      ]),
      serviceArea: 'Kathmandu Valley Commercial Hubs',
      isActive: true,
      sortOrder: 8,
    },
  ];

  await prisma.service.deleteMany({});
  for (const s of services) {
    await prisma.service.create({ data: s });
  }

  // 4. Homepage Sections (Editable ordering & active toggle)
  const sections = [
    { sectionKey: 'hero', label: 'Hero Banner Slider', isEnabled: true, sortOrder: 1 },
    { sectionKey: 'emergency_banner', label: 'Emergency Contact Bar', isEnabled: true, sortOrder: 2 },
    { sectionKey: 'services', label: 'Featured Electrical Services', isEnabled: true, sortOrder: 3 },
    { sectionKey: 'why_choose_us', label: 'Why Choose VoltixNepal', isEnabled: true, sortOrder: 4 },
    { sectionKey: 'about', label: 'About Sanjit Mishra', isEnabled: true, sortOrder: 5 },
    { sectionKey: 'testimonials', label: 'Customer Reviews', isEnabled: true, sortOrder: 6 },
    { sectionKey: 'faq', label: 'Frequently Asked Questions', isEnabled: true, sortOrder: 7 },
    { sectionKey: 'blog', label: 'Electrical Safety Tips & Articles', isEnabled: true, sortOrder: 8 },
    { sectionKey: 'cta', label: 'Book Service CTA Banner', isEnabled: true, sortOrder: 9 },
  ];

  await prisma.homepageSection.deleteMany({});
  for (const sec of sections) {
    await prisma.homepageSection.create({ data: sec });
  }

  // 5. Testimonials (Realistic, authentic customer feedback)
  const testimonials = [
    {
      customerName: 'Ramesh Adhikari',
      location: 'Baneshwor, Kathmandu',
      rating: 5,
      content: 'Had a severe MCB tripping issue in our main distribution board at 8 PM. Sanjit arrived within 45 minutes, found a burned wire inside the wall conduit, and fixed it safely. Very polite, clean work and fair pricing.',
      date: 'February 2026',
      photoUrl: null,
      isApproved: true,
    },
    {
      customerName: 'Sunita Shrestha',
      location: 'Jhamsikhel, Lalitpur',
      rating: 5,
      content: 'VoltixNepal did the complete electrical wiring and LED panel fitting for our new 2.5-story house. Every switchboard was neatly aligned and load-balanced. Highly recommended electrician in Kathmandu Valley.',
      date: 'January 2026',
      photoUrl: null,
      isApproved: true,
    },
    {
      customerName: 'Bikash Maharjan',
      location: 'Suryabinayak, Bhaktapur',
      rating: 5,
      content: 'Installed our Luminous 1500VA inverter and dual tubular batteries. Clean wire routing, proper lugs used, and zero mess left behind. Truly professional service.',
      date: 'January 2026',
      photoUrl: null,
      isApproved: true,
    },
    {
      customerName: 'Anil Gurung',
      location: 'Lazimpat, Kathmandu',
      rating: 5,
      content: 'We had persistent electrical shock on our metal sink caused by improper earthing. Sanjit installed a proper chemical ground pit and brought earth resistance down below 3 Ohms. Problem completely resolved.',
      date: 'December 2025',
      photoUrl: null,
      isApproved: true,
    },
  ];

  await prisma.testimonial.deleteMany({});
  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }

  // 6. FAQs (Practical questions for local customers)
  const faqs = [
    {
      question: 'How quickly can you attend an emergency electrical issue in Kathmandu?',
      answer: 'For emergency calls (such as total blackout, sparking, burning smells, or major circuit breakdown), we prioritize rapid response and typically reach locations across Kathmandu, Lalitpur, and Bhaktapur within 45 to 90 minutes depending on traffic and exact location.',
      category: 'Emergency',
      isActive: true,
      sortOrder: 1,
    },
    {
      question: 'How do you charge for electrical repair and installation services?',
      answer: 'For standard repairs and troubleshooting, we charge an inspection fee starting from Rs. 500-600 which covers diagnostic testing. If you proceed with the repair work, the quote is clearly explained before starting. For large projects like full house wiring, we provide itemized point-wise or turnkey quotes after visiting the site.',
      category: 'Pricing',
      isActive: true,
      sortOrder: 2,
    },
    {
      question: 'Do you provide genuine electrical materials and spare parts?',
      answer: 'Yes. We recommend and use certified, high-grade materials (Havells, Finolex, Schneider, Panasonic/Anchor, Pioneer, etc.) with proper safety certifications. If you prefer to supply your own materials, we are completely happy to provide only skilled labor.',
      category: 'Materials',
      isActive: true,
      sortOrder: 3,
    },
    {
      question: 'Why does my MCB breaker trip repeatedly?',
      answer: 'An MCB trips for three main reasons: an electrical overload (too many appliances running on one circuit), a short circuit (phase and neutral touching due to damaged insulation), or a ground fault. We use multimeters to pinpoint the faulty line safely rather than forcefully keeping the breaker on, which could cause a fire.',
      category: 'Technical',
      isActive: true,
      sortOrder: 4,
    },
    {
      question: 'Can you help calculate the right inverter and battery size for my home?',
      answer: 'Absolutely. We calculate your required wattage based on the specific lights, fans, Wi-Fi routers, and appliances you want to run during power cuts, ensuring you do not overspend on oversized equipment or suffer premature battery drain.',
      category: 'Inverter',
      isActive: true,
      sortOrder: 5,
    },
    {
      question: 'How do I place a service request on the website?',
      answer: 'Simply click the "Request a Service" button, select the electrical issue you are facing, choose your preferred date/time, and allow your browser location or type your address. When submitted, the request is immediately logged and sent to us via WhatsApp and Email for instant confirmation.',
      category: 'Booking',
      isActive: true,
      sortOrder: 6,
    },
  ];

  await prisma.faq.deleteMany({});
  for (const f of faqs) {
    await prisma.faq.create({ data: f });
  }

  // 7. Blog Posts (Rich, practical guides)
  const blogPosts = [
    {
      slug: 'why-mcb-trips-monsoon-nepal',
      title: 'Why Does Your MCB Keep Tripping in the Monsoon? Causes & Safe Solutions',
      summary: 'Moisture infiltration, underground pipe leakage, and loose outdoor fittings frequently trigger circuit breakers during the rainy season in Nepal. Here is how to identify and fix them.',
      content: `Monsoon season in Nepal brings heavy rains and high humidity, which can test your home electrical system to its limits. One of the most common service calls we receive at VoltixNepal during this period is: "Why does my main breaker trip whenever it rains?"

### 1. Water Ingress in Outdoor Fixtures
Outdoor gate lights, balcony sockets, and rooftop pump connections are often exposed to heavy rain. If waterproof gaskets have degraded, water enters the junction box, bridging the live and neutral terminals, instantly tripping the circuit breaker or RCCB.

### 2. Moisture Inside Concealed Wall Conduits
In houses with minor exterior wall dampness (seepage), moisture can condense inside PVC electrical conduit pipes. Old wire insulation with micro-cracks will leak current to the wall masonry, causing sensitive earth-leakage devices to trip.

### 3. Overloaded Circuits During Rainy Days
Monsoon often coincides with high usage of immersion water heaters, geysers, washing machine dryers, and induction cooktops simultaneously on single 10A/16A circuits.

### What You Should NEVER Do:
- Never tape down or force a tripped MCB into the ON position.
- Never operate switchboards with wet hands or bare feet on damp floors.
- Never replace a breaker with a higher amperage rating without upgrading the underlying wire thickness.

### Professional Solution:
If your breaker trips consistently, turn off the affected circuit isolator and contact VoltixNepal for an insulation resistance test using a certified digital megohmmeter.`,
      featuredImage: 'https://images.unsplash.com/photo-1544725121-be3bf52e2dc8?auto=format&fit=crop&w=1200&q=80',
      category: 'Electrical Safety',
      tags: 'MCB,monsoon,tripping,safety,nepal',
      author: 'Sanjit Mishra',
      seoTitle: 'Why MCB Trips in Monsoon in Nepal - VoltixNepal Safety Guide',
      metaDescription: 'Learn why your electrical circuit breaker trips during rainy season in Kathmandu and how to safely troubleshoot moisture and overload issues.',
      isPublished: true,
      publishedAt: new Date('2026-02-15'),
    },
    {
      slug: 'how-to-calculate-inverter-battery-size',
      title: 'How to Choose the Right Inverter & Battery Size for Your Home in Nepal',
      summary: 'A step-by-step guide to calculating running wattage, inverter VA rating, and tubular battery AH capacity for reliable backup power.',
      content: `Investing in a power backup system for your home or shop requires proper sizing to ensure your essential lights, fans, computers, and Wi-Fi stay powered during outages without draining batteries prematurely.

### Step 1: Calculate Total Wattage Load
List out the appliances you strictly need to run during a power cut:
- 4 LED Bulbs (9W each) = 36W
- 2 Ceiling Fans (70W each) = 140W
- 1 Wi-Fi Router = 15W
- 1 Laptop Charger = 65W
- 1 LED TV (43-inch) = 75W
**Total Power Requirement = 326 Watts**

### Step 2: Determine Inverter VA Rating
Inverters have a power factor (typically 0.8). To support 326W comfortably with a 20% safety margin:
- Required Wattage with Margin = 326 / 0.8 * 1.2 = ~490 VA.
- A standard **850VA or 1100VA Pure Sine Wave Inverter** is the ideal choice.

### Step 3: Determine Battery Capacity (AH)
If you require 4 hours of backup time at 326 Watts on a single 12V battery:
- Battery Capacity (AH) = (326W * 4 Hours) / (12V * 0.8 efficiency) = **170 AH**.
- A **150AH to 200AH Tall Tubular Battery** will provide smooth, long-lasting performance.

### Expert Advice from VoltixNepal:
Always choose **Pure Sine Wave** inverters over Square Wave models to protect modern electronic gadgets, fans, and televisions from humming noises and PCB damage. Contact us for professional installation with heavy-gauge cables.`,
      featuredImage: 'https://images.unsplash.com/photo-1508873696983-2df57046475a?auto=format&fit=crop&w=1200&q=80',
      category: 'Inverter Guide',
      tags: 'inverter,battery,sizing,backup,kathmandu',
      author: 'Sanjit Mishra',
      seoTitle: 'How to Size Home Inverter & Battery in Nepal - VoltixNepal',
      metaDescription: 'Calculate the right inverter VA and tubular battery AH capacity for your home or office in Nepal. Practical guide by electrician Sanjit Mishra.',
      isPublished: true,
      publishedAt: new Date('2026-01-28'),
    },
    {
      slug: 'essential-house-wiring-safety-tips',
      title: 'Top 7 Electrical Safety Checks Every Homeowner Should Know',
      summary: 'Simple but critical safety checks to prevent electrical fires, appliance damage, and electric shocks in residential buildings.',
      content: `Electrical safety is often overlooked until an emergency happens. Faulty wiring and substandard accessories remain leading causes of residential fires. Here are 7 essential checks you should conduct regularly:

1. **Check for Warm Switch Plates:** Place your hand gently on switches and wall plugs. If any plate feels noticeably warm, it indicates a loose terminal screw or overloading.
2. **Test Your RCCB Test Button Monthly:** Modern distribution boxes have an RCCB (Earth Leakage Breaker) with a small 'T' (Test) button. Pressing it should immediately trip the lever. If it doesn't, your shock protection is not functioning.
3. **Never Overload Extension Strips:** Multi-plug strips are designed for low-power electronics like phone chargers and lamps, not for 2000W room heaters or electric kettles.
4. **Inspect Refrigerator and Washing Machine Earthing:** If you feel a mild static or tingling sensation when touching metallic appliances, your house earthing is broken or disconnected.
5. **Keep Electrical Panels Accessible:** Never block your distribution box behind heavy wardrobes or storage boxes. In an emergency, every second counts.
6. **Replace Discolored or Buzzing Outlets:** Any plug that makes a sizzling or buzzing noise has an internal contact arc that needs immediate replacement.
7. **Schedule Annual Electrical Audits:** Have a certified electrician inspect main connections, neutral tightness, and breaker health at least once a year.

For thorough safety inspections in Kathmandu, Lalitpur, or Bhaktapur, schedule an appointment with VoltixNepal.`,
      featuredImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
      category: 'Electrical Safety',
      tags: 'safety,wiring,rccb,earthing,homeowner',
      author: 'Sanjit Mishra',
      seoTitle: '7 Essential Home Electrical Safety Checks - VoltixNepal',
      metaDescription: 'Prevent house fires and shocks with these 7 practical electrical safety tips from Kathmandu electrician Sanjit Mishra.',
      isPublished: true,
      publishedAt: new Date('2026-01-10'),
    },
  ];

  await prisma.blogPost.deleteMany({});
  for (const post of blogPosts) {
    await prisma.blogPost.create({ data: post });
  }

  // 8. Gallery Items (Photos & Videos)
  const galleryItems = [
    {
      title: 'Full 3-Storey House Concealed Conduit Wiring',
      description: 'Complete slab and brick-wall conduit piping with flame-retardant copper wiring and modular metal box fitting.',
      mediaType: 'PHOTO',
      storageProvider: 'CLOUDINARY',
      mediaUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
      category: 'House Wiring',
      location: 'Baneshwor, Kathmandu',
      isPublished: true,
      sortOrder: 1,
    },
    {
      title: '24/7 Emergency MCB Tripping & Burnt Neutral Line Repair',
      description: 'Troubleshooting repeated circuit breaker tripping caused by a damaged neutral line inside wall conduit.',
      mediaType: 'VIDEO',
      storageProvider: 'CLOUDFLARE_R2',
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      category: 'Emergency Repair',
      location: 'Jhamsikhel, Lalitpur',
      isPublished: true,
      sortOrder: 2,
    },
    {
      title: 'Dual 220AH Tubular Battery & Pure Sine Wave Inverter Setup',
      description: 'Heavy duty inverter power backup installation with copper lugs and segregated emergency lines.',
      mediaType: 'PHOTO',
      storageProvider: 'CLOUDINARY',
      mediaUrl: 'https://images.unsplash.com/photo-1508873696983-2df57046475a?auto=format&fit=crop&w=1200&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1508873696983-2df57046475a?auto=format&fit=crop&w=600&q=80',
      category: 'Inverter & Battery',
      location: 'Suryabinayak, Bhaktapur',
      isPublished: true,
      sortOrder: 3,
    },
    {
      title: 'Chemical Earthing Pit Installation & Ground Resistance Testing',
      description: 'Deep grounding pit excavation, copper bonded electrode rod installation with conductive backfill compound.',
      mediaType: 'PHOTO',
      storageProvider: 'CLOUDINARY',
      mediaUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=1200&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=600&q=80',
      category: 'Earthing Pit',
      location: 'Lazimpat, Kathmandu',
      isPublished: true,
      sortOrder: 4,
    },
    {
      title: 'Distribution Board 12-Way Double Door MCB & RCCB Dressing',
      description: 'Replacing old fuse cutouts with Schneider Acti9 MCB and 30mA RCCB for human electric shock protection.',
      mediaType: 'PHOTO',
      storageProvider: 'CLOUDINARY',
      mediaUrl: 'https://images.unsplash.com/photo-1544725121-be3bf52e2dc8?auto=format&fit=crop&w=1200&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544725121-be3bf52e2dc8?auto=format&fit=crop&w=600&q=80',
      category: 'Distribution Board',
      location: 'Koteshwor, Kathmandu',
      isPublished: true,
      sortOrder: 5,
    },
    {
      title: 'Modern LED False Ceiling Profile & Magnetic Track Installation',
      description: 'Recessed aluminum profile light channels with warm white 3000K strips and concealed driver setup.',
      mediaType: 'VIDEO',
      storageProvider: 'CLOUDFLARE_R2',
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&q=80',
      category: 'Lighting & Fixtures',
      location: 'Sanepa, Lalitpur',
      isPublished: true,
      sortOrder: 6,
    },
    {
      title: 'Commercial Restaurant 3-Phase Commercial Load Balancing',
      description: 'Phase balancing across commercial induction burners, chillers, and HVAC units.',
      mediaType: 'PHOTO',
      storageProvider: 'CLOUDINARY',
      mediaUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
      category: 'Commercial Automation',
      location: 'Thamel, Kathmandu',
      isPublished: true,
      sortOrder: 7,
    },
  ];

  await prisma.galleryItem.deleteMany({});
  for (const item of galleryItems) {
    await prisma.galleryItem.create({ data: item });
  }

  // 9. Create Initial Admin Notification
  await prisma.notification.create({
    data: {
      type: 'SYSTEM',
      title: 'VoltixNepal Platform Ready',
      message: 'System initialized successfully with initial services, hero slides, gallery items, and business settings for Sanjit Mishra.',
      link: '/admin',
      isRead: false,
    },
  });

  console.log('Database seeded successfully with authentic VoltixNepal content.');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

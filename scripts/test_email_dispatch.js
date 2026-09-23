const { sendAdminNewRequestNotification } = require('../lib/email');

async function testDispatch() {
  console.log('Sending test transactional email via Gmail SMTP (voltixnepal@gmail.com)...');

  const testPayload = {
    requestId: 'VN-2026-TEST01',
    customerName: 'Bishal Dev (Test Client)',
    customerPhone: '+977 9825870047',
    customerEmail: 'voltixnepal@gmail.com',
    preferredContact: 'WHATSAPP',
    serviceName: 'House Wiring & Concealed Piping Installation',
    urgency: 'URGENT',
    preferredDate: '2026-09-24',
    preferredTime: 'Morning (9:00 AM - 12:00 PM)',
    description: 'Testing Google Gmail SMTP integration for VoltixNepal automated dispatch.',
    address: 'New Baneshwor, Kathmandu',
    area: 'Baneshwor Chowk',
    city: 'Kathmandu',
    googleMapsUrl: 'https://maps.google.com/?q=27.6915,85.3420',
    latitude: 27.6915,
    longitude: 85.3420,
    additionalNotes: 'Test order verified with Google SMTP credentials.',
    createdAt: new Date(),
  };

  const result = await sendAdminNewRequestNotification(testPayload);
  if (result.success) {
    console.log('🎉 Automated email dispatched successfully to voltixnepal@gmail.com and bishaldev949@gmail.com!');
  } else {
    console.error('❌ Failed:', result.error);
  }
}

testDispatch();

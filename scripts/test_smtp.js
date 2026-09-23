const nodemailer = require('nodemailer');

async function testGmailSMTP() {
  console.log('Testing connection to Google Gmail SMTP servers...');

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'voltixnepal@gmail.com',
      pass: 'giywifnxmcxgogkg',
    },
  });

  try {
    const verifyResult = await transporter.verify();
    console.log('✅ Google Gmail SMTP Authentication SUCCESSFUL! Server is ready to send emails.');
    return true;
  } catch (err) {
    console.error('❌ SMTP Connection failed:', err);
    return false;
  }
}

testGmailSMTP();

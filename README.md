# VoltixNepal — Professional Electrical Services Web Platform

A production-ready full-stack business web platform built for **VoltixNepal** (Owner: **Sanjit Mishra**, Domain: `voltixnepal.com`). Designed specifically as an authentic, professional trade and electrical contracting platform with dual-channel order dispatch (WhatsApp + SMTP email), browser geolocation with automatic Google Maps link generation, customer portal, and a complete Admin Content Management System (CMS).

---

## ⚡ Key Highlights & Design Philosophy

1. **Non-AI Aesthetic**: Clean white background (`#FFFFFF`), subtle slate borders (`#E2E8F0`), deep charcoal text (`#0F172A`), Voltix Red primary buttons (`#DC2626`), and warm electrical Amber highlights (`#D97706`). Strictly no AI gradients, glowing neon effects, blinking dots, or oversized chatbot typography.
2. **Dual-Channel Dispatch**: When a customer places a service order, the system simultaneously:
   - Logs the order with a unique Request ID (e.g. `VN-2026-000001`) in the database.
   - Prepares and opens a formatted WhatsApp order payload directly to the business number.
   - Sends an HTML email alert to the admin's inbox.
   - Sends an HTML confirmation receipt to the customer's email.
3. **GPS Geolocation & Google Maps**: Customers can click *"Use My Current Location"* to capture their precise GPS latitude and longitude. The admin can click 1-button *"Open in Google Maps"* or *"Get Driving Directions"* directly from the admin dashboard.
4. **Firebase Spark Plan Compatibility**: Firebase Authentication (Email/Password + Google sign-in) without requiring Firebase Storage. All images utilize external CDN/Unsplash URLs manageable via the Admin CMS.
5. **Full Admin CMS**: Manage 5 hero slides, electrical services, FAQs, blog articles, verified testimonials, homepage section order, phone/WhatsApp numbers, and business hours without touching code.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js v18+ or v20+
- npm v9+

### 2. Installation
```bash
# Clone or navigate to the repository
cd "Voltix Nepal"

# Install dependencies
npm install
```

### 3. Initialize Database & Seed Content
The platform uses Prisma ORM with SQLite for zero-setup local development, and seamlessly connects to Supabase/PostgreSQL in production.

```bash
# Push Prisma schema to local database
npx prisma db push

# Seed authentic VoltixNepal services, 5 hero slides, blogs, FAQs, and settings
node -e "require('ts-node').register({compilerOptions:{module:'commonjs'}}); require('./prisma/seed.ts');"
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the public website.

---

## 🔑 Admin Access & Initial Credentials

- **Admin Login Route**: `/admin/login`
- **Default Admin Email**: `sanjit@voltixnepal.com`
- **Default Admin PIN / Password**: `Voltix2026Admin!`

Once logged in, you have complete control over:
- **Service Requests**: Live status switcher (`NEW` → `CONTACTED` → `CONFIRMED` → `IN_PROGRESS` → `COMPLETED` → `CANCELLED`), 1-click WhatsApp customer reply, call button, Google Maps navigation.
- **Services CMS**: Add/edit house wiring, MCB troubleshooting, inverter setup, and custom pricing.
- **Hero Slider**: Manage 5 banner slides, headings, image URLs, and button actions.
- **Homepage Sections**: Reorder and toggle sections on the homepage.
- **Website Settings**: Update WhatsApp number, business phone, emergency banner, operating hours, and social media links.

---

## ⚙️ Environment Configuration (`.env`)

Create a `.env` file in the root directory (see `.env.example`):

```env
# Database Connection
# Local development:
DATABASE_URL="file:./dev.db"
# Production Supabase / PostgreSQL:
# DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?schema=public"

NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Admin Secret & Initial Credentials
ADMIN_EMAIL="sanjit@voltixnepal.com"
ADMIN_INITIAL_PIN="Voltix2026Admin!"
ADMIN_SECRET_KEY="voltix-secret-admin-token-super-secure-key"

# WhatsApp Business Dispatch (Country Code + Digits, no + or spaces)
WHATSAPP_BUSINESS_NUMBER="9779800000000"

# SMTP Email Configuration (Nodemailer - Server-side only)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="notifications@voltixnepal.com"
SMTP_PASSWORD="your-google-app-password"
SMTP_FROM="VoltixNepal <notifications@voltixnepal.com>"

# Firebase Authentication (Client SDK)
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="voltixnepal-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="voltixnepal-project"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="voltixnepal-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abcdef"
```

---

## 📧 SMTP Email Configuration Guide

To enable live email dispatch using Gmail / Google Workspace:
1. Go to your Google Account Settings → **Security** → Enable **2-Step Verification**.
2. Search for **App passwords** (under 2-Step Verification).
3. Create a new App Password named `VoltixNepal-Website`.
4. Copy the 16-character generated password into `SMTP_PASSWORD` in your `.env`.
5. Set `SMTP_HOST="smtp.gmail.com"`, `SMTP_PORT=587`, and `SMTP_USER="your-email@gmail.com"`.

*Note: In development without SMTP credentials, the application logs transactions to the console without interrupting the user booking experience.*

---

## 🔥 Firebase Authentication Setup (Spark Free Plan)

1. Open [Firebase Console](https://console.firebase.google.com/) and create a new project `VoltixNepal`.
2. Navigate to **Build** → **Authentication** → Click **Get Started**.
3. Enable **Email/Password** provider.
4. Enable **Google** provider under Sign-in methods.
5. In **Project Settings**, register a Web App (`</>`) and copy the config values to your `.env` file.
6. Under **Authentication** → **Settings** → **Authorized domains**, add `voltixnepal.com` and `localhost`.

---

## 🗄️ PostgreSQL / Supabase Database Setup (Production)

1. Create a free project on [Supabase](https://supabase.com/).
2. Go to **Project Settings** → **Database** → Copy the **Connection String (URI)** (Transaction mode or Session mode).
3. In `prisma/schema.prisma`, update the provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Run migration:
   ```bash
   npx prisma db push
   ```

---

## 🌐 Deploying to Vercel

1. Push the code to GitHub.
2. Import repository into [Vercel](https://vercel.com).
3. Under **Environment Variables**, add all keys from `.env.example`.
4. Deploy! Vercel automatically runs `prisma generate && next build`.

---

## 📋 Production Security Checklist

- [x] Server-side validation with Zod schemas.
- [x] SMTP and admin secret keys are strictly server-side isolated (never exposed in client bundles).
- [x] Anti-duplicate submit locking (`SENDING REQUEST...`).
- [x] LocalBusiness & Electrician Schema JSON-LD for search engines.
- [x] Fully responsive from 320px mobile screens to 4K desktop displays.
- [x] Zero AI visual cliches, blinking dots, or giant buttons.

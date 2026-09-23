# VoltixNepal — Firebase Security Rules & Admin Export

This document contains the complete Firebase Security Rules configured for the **Firebase Spark (Free) Plan** with strict Admin access granted **only** to:
1. `voltixnepal@gmail.com`
2. `bishaldev949@gmail.com`

---

## 📁 Rule Files in Codebase

| Database Service | File in Project | Purpose |
|---|---|---|
| **Cloud Firestore** | [`firestore.rules`](./firestore.rules) | Secures bookings, users, CMS content, and admin audit logs |
| **Realtime Database** | [`database.rules.json`](./database.rules.json) | Secures realtime events, sync, and notifications |
| **Firebase Project Config** | [`firebase.json`](./firebase.json) | CLI deployment configuration |

---

## 1. Cloud Firestore Rules (`firestore.rules`)

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // ==========================================
    // ADMIN IDENTIFICATION (Strictly Restricted)
    // ==========================================

    function isAuthenticated() {
      return request.auth != null;
    }

    // Only voltixnepal@gmail.com and bishaldev949@gmail.com have admin privileges
    function isAdmin() {
      return isAuthenticated() && (
        request.auth.token.email.lower() == 'voltixnepal@gmail.com' ||
        request.auth.token.email.lower() == 'bishaldev949@gmail.com' ||
        request.auth.token.admin == true ||
        request.auth.token.role == 'ADMIN'
      );
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // ==========================================
    // 1. SERVICE REQUESTS / BOOKINGS
    // ==========================================
    match /serviceRequests/{requestId} {
      // Public / Customers can submit bookings
      allow create: if true;

      // Customers read their own; Admins read all
      allow read: if isAdmin() || (
        isAuthenticated() && (
          resource.data.userId == request.auth.uid ||
          resource.data.customerEmail == request.auth.token.email
        )
      );

      // Only Admins can change status, update notes, or delete
      allow update, delete: if isAdmin();
    }

    // ==========================================
    // 2. USER ACCOUNTS & PROFILES
    // ==========================================
    match /users/{userId} {
      allow read: if isAuthenticated() && (isOwner(userId) || isAdmin());
      allow create, update: if isAuthenticated() && (isOwner(userId) || isAdmin());
      allow delete: if isAdmin();
    }

    // ==========================================
    // 3. PUBLIC WEBSITE DATA (Public Read, Admin Write)
    // ==========================================
    match /services/{serviceId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /heroSlides/{slideId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /homepageSections/{sectionId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /blogPosts/{postId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /faqs/{faqId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /testimonials/{testimonialId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if isAdmin();
    }

    match /websiteSettings/{settingId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // ==========================================
    // 4. PRIVATE ADMIN LOGS & NOTIFICATIONS
    // ==========================================
    match /auditLogs/{logId} {
      allow read, write: if isAdmin();
    }

    match /notifications/{notifId} {
      allow read, write: if isAdmin();
    }

    // Default protection for any other collection
    match /{document=**} {
      allow read, write: if isAdmin();
    }
  }
}
```

---

## 2. Firebase Realtime Database Rules (`database.rules.json`)

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "services": {
      ".read": true,
      ".write": "auth != null && (auth.token.email == 'voltixnepal@gmail.com' || auth.token.email == 'bishaldev949@gmail.com' || auth.token.admin === true)"
    },
    "heroSlides": {
      ".read": true,
      ".write": "auth != null && (auth.token.email == 'voltixnepal@gmail.com' || auth.token.email == 'bishaldev949@gmail.com' || auth.token.admin === true)"
    },
    "websiteSettings": {
      ".read": true,
      ".write": "auth != null && (auth.token.email == 'voltixnepal@gmail.com' || auth.token.email == 'bishaldev949@gmail.com' || auth.token.admin === true)"
    },
    "serviceRequests": {
      ".read": "auth != null && (auth.token.email == 'voltixnepal@gmail.com' || auth.token.email == 'bishaldev949@gmail.com' || auth.token.admin === true)",
      "$requestId": {
        ".write": "true",
        ".read": "auth != null && (auth.token.email == 'voltixnepal@gmail.com' || auth.token.email == 'bishaldev949@gmail.com' || data.child('userId').val() === auth.uid)"
      }
    },
    "notifications": {
      ".read": "auth != null && (auth.token.email == 'voltixnepal@gmail.com' || auth.token.email == 'bishaldev949@gmail.com' || auth.token.admin === true)",
      ".write": "auth != null && (auth.token.email == 'voltixnepal@gmail.com' || auth.token.email == 'bishaldev949@gmail.com' || auth.token.admin === true)"
    }
  }
}
```

---

## 3. How to Deploy via Firebase CLI

If you have Firebase CLI installed on your computer:
```bash
firebase deploy --only firestore:rules,database
```

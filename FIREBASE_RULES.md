# VoltixNepal — 100% Free Spark Plan Firebase Rules

> **No Blaze Upgrade Required ($0/month Spark Plan)**
> Media files are stored on **Cloudinary** (Photos < 100MB) and **Cloudflare R2** (Videos < 500MB). 
> Firebase is only used for **Cloud Firestore** and **Realtime Database**.

---

## 1. Cloud Firestore Rules (`firestore.rules`)
Copy and paste this into **Firebase Console ➔ Firestore Database ➔ Rules**:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // ==========================================
    // ADMIN AUTHENTICATION
    // ==========================================
    function isAuthenticated() {
      return request.auth != null;
    }

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
    // 1. SERVICE REQUESTS & BOOKINGS
    // ==========================================
    match /serviceRequests/{requestId} {
      allow create: if true;
      allow read: if isAdmin() || (
        isAuthenticated() && (
          resource.data.userId == request.auth.uid ||
          resource.data.customerEmail == request.auth.token.email
        )
      );
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

    match /customers/{customerId} {
      allow read, write: if isAdmin();
    }

    // ==========================================
    // 3. DAILY WORK GALLERY (Photos & Videos)
    // ==========================================
    match /galleryItems/{itemId} {
      allow read: if isAdmin() || resource.data.isPublished == true || !('isPublished' in resource.data);
      allow write: if isAdmin();
    }

    match /gallery/{itemId} {
      allow read: if isAdmin() || resource.data.isPublished == true || !('isPublished' in resource.data);
      allow write: if isAdmin();
    }

    // ==========================================
    // 4. PUBLIC WEBSITE CMS
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

    match /contactMessages/{messageId} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }

    match /websiteSettings/{settingId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // ==========================================
    // 5. PRIVATE ADMIN LOGS & NOTIFICATIONS
    // ==========================================
    match /auditLogs/{logId} {
      allow read, write: if isAdmin();
    }

    match /notifications/{notifId} {
      allow read, write: if isAdmin();
    }

    // Default protection
    match /{document=**} {
      allow read, write: if isAdmin();
    }
  }
}
```

---

## 2. Realtime Database Rules (`database.rules.json`)
Copy and paste this into **Firebase Console ➔ Realtime Database ➔ Rules**:

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
    "homepageSections": {
      ".read": true,
      ".write": "auth != null && (auth.token.email == 'voltixnepal@gmail.com' || auth.token.email == 'bishaldev949@gmail.com' || auth.token.admin === true)"
    },
    "websiteSettings": {
      ".read": true,
      ".write": "auth != null && (auth.token.email == 'voltixnepal@gmail.com' || auth.token.email == 'bishaldev949@gmail.com' || auth.token.admin === true)"
    },
    "galleryItems": {
      ".read": true,
      ".write": "auth != null && (auth.token.email == 'voltixnepal@gmail.com' || auth.token.email == 'bishaldev949@gmail.com' || auth.token.admin === true)"
    },
    "gallery": {
      ".read": true,
      ".write": "auth != null && (auth.token.email == 'voltixnepal@gmail.com' || auth.token.email == 'bishaldev949@gmail.com' || auth.token.admin === true)"
    },
    "blogPosts": {
      ".read": true,
      ".write": "auth != null && (auth.token.email == 'voltixnepal@gmail.com' || auth.token.email == 'bishaldev949@gmail.com' || auth.token.admin === true)"
    },
    "faqs": {
      ".read": true,
      ".write": "auth != null && (auth.token.email == 'voltixnepal@gmail.com' || auth.token.email == 'bishaldev949@gmail.com' || auth.token.admin === true)"
    },
    "testimonials": {
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
    "contactMessages": {
      ".read": "auth != null && (auth.token.email == 'voltixnepal@gmail.com' || auth.token.email == 'bishaldev949@gmail.com' || auth.token.admin === true)",
      "$messageId": {
        ".write": "true"
      }
    },
    "notifications": {
      ".read": "auth != null && (auth.token.email == 'voltixnepal@gmail.com' || auth.token.email == 'bishaldev949@gmail.com' || auth.token.admin === true)",
      ".write": "auth != null && (auth.token.email == 'voltixnepal@gmail.com' || auth.token.email == 'bishaldev949@gmail.com' || auth.token.admin === true)"
    },
    "auditLogs": {
      ".read": "auth != null && (auth.token.email == 'voltixnepal@gmail.com' || auth.token.email == 'bishaldev949@gmail.com' || auth.token.admin === true)",
      ".write": "auth != null && (auth.token.email == 'voltixnepal@gmail.com' || auth.token.email == 'bishaldev949@gmail.com' || auth.token.admin === true)"
    }
  }
}
```

---

## 3. Deploy via Firebase CLI (Spark Free Plan)

```bash
firebase deploy --only firestore:rules,database
```

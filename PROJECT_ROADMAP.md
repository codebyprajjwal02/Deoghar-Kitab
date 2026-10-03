# Project Roadmap: Deoghar Kitab

This document outlines the current version, completed features, upcoming features, priorities, and architectural vision for the Deoghar Kitab ecosystem.

---

## 1. Current Version
- **Version:** v1.1.0-beta
- **Status:** Active / Production-ready

---

## 2. Feature Status & Milestones

### Core Platform (Completed)
- [x] Firebase Login & JWT Authentication
- [x] Browse Books, Details, and Book Card UI
- [x] Book Upload & Management
- [x] Wishlist & Basic Cart System
- [x] Universal Seller System (instant access to Seller Dashboard)
- [x] Direct Routing (`/seller-dashboard`)
- [x] Admin Control Panel (Books, Users, Database operations)

### Smart Local Book Commerce (Completed)
- [x] **Nearby Book Search:** Location detection, filter/sort by distance, price, pickup time.
- [x] **Book Reservation:** Locking inventory, QR Code generation, merchant alert, pickup closure.
- [x] **Reservation Expiry:** Automated inventory unlock, cancellation rules.
- [x] **Demand Analytics & Insights:** Logging search patterns (especially unavailable/out-of-stock), trending alerts.
- [x] **Shopkeeper Insights & Dashboard:** Daily forecast, low stock alerts, inventory recommendation.
- [x] **Book Request Service:** Interactive out-of-stock requesting with merchant availability updates.
- [x] **Inventory Tools:** Barcode scanning integration, bulk spreadsheet uploads.

---

## 3. Implementation Blueprint & Estimates

| Feature | Priority | Complexity | Target Release | Tech Stack Impact |
| :--- | :--- | :--- | :--- | :--- |
| Nearby Book Search | High | Medium | v1.2.0 | Location queries, Geolocation API, sorting hooks |
| Book Reservation & QR | High | High | v1.2.0 | QR code generator, status lock, Reservation Model |
| Reservation Expiry Engine | Medium | Medium | v1.2.0 | Expiry checker middleware/timer, status release |
| Demand & Search Tracker | Medium | Low | v1.3.0 | Analytics Model, search logging middleware |
| Shopkeeper Dashboard Analytics | Medium | High | v1.3.0 | Aggregation pipelines, Chart UI components |
| Request-A-Book Service | High | Medium | v1.3.0 | Chat/Message integration, custom responses |
| Barcode & Bulk Uploads | Low | Medium | v1.4.0 | QuaggaJS/HTML5 reader, CSV/Excel parsers |

---

## 4. Future Architecture Vision
- **Service-Oriented Scaling:** Separate background jobs (such as reservation expiry timers and email reminder hooks) into dedicated workers.
- **Offline Capabilities:** Utilize Service Workers to cache browse requests and details for students with poor connectivity.
- **PWA Integration:** Wrap the React Vite build as a Progressive Web App (PWA) for native mobile installation.

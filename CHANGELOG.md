# Changelog: Deoghar Kitab

All notable changes to this project will be documented in this file.

---

## [1.2.0] - 2026-07-11
### Added
- **Nearby Book Search:** Real-time geolocation coordinate tracking with sorting options for distance (km), price, rating, and stock availability.
- **Book Reservation:** Locking mechanisms for books in hold status, automatic generation of QR codes, and automated hold-expiry validation task.
- **Out-of-Stock Broadcast Request System:** Allows students to broadcast unavailable book titles to nearby merchants and accept reservation quotes from stores.
- **Shopkeeper Demand Analytics & Insights:** Dynamic merchant dashboard featuring local top search queries, low stock alerts, smart inventory recommendations, and AI-powered demand forecasts.
- **Smart Inventory Tools:** Barcode/ISBN scanner lookup integration and bulk CSV inventory upload parser.

---

## [1.1.0] - 2026-07-03
### Refactored
- **Seller Approval System:** Completely eliminated the seller approval system. Removed pending statuses, request workflows, and admin queues.
- **Routing:** Changed `/seller` to `/seller-dashboard` and mapped it directly to the dashboard, avoiding the redirection wrapper.
- **Backend Defaults:** Defaulted `isSellerApproved` to `true` and `sellerRequestStatus` to `'approved'` inside the MongoDB User schema and controller responses.
- **Admin Panel:** Cleaned the Admin Panel sidebar and quick actions by removing Seller registration management.

---

## [1.0.0] - Initial Release
### Added
- Complete React Vite frontend with Tailwind CSS styling.
- Express.js backend with MongoDB database connections.
- JWT and Firebase authentication integration.
- Book uploading, editing, and deleting capabilities.
- Live Chat and notifications flow.

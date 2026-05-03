# Bannu Masala Admin: React Native App Development Prompt (Updated)

This document provides a comprehensive technical prompt to be used with an AI developer or a software engineer to build a dedicated mobile application for managing the Bannu Masala store.

---

### **Project Overview**
Build a professional **React Native (Expo)** mobile application for the "Bannu Masala" store owner to manage customer orders, inventory, and track performance with real-time push notifications.

### **1. Technical Stack**
- **Framework:** React Native with Expo (Managed Workflow, Expo Router).
- **Styling:** NativeWind (Tailwind CSS for React Native).
- **Data Management:** TanStack Query (React Query) for API sync.
- **Backend API:** Connects to existing Next.js 15 backend (Neon PostgreSQL).
- **Notifications:** Firebase Cloud Messaging (FCM).

### **2. Admin API Details**
- **Base URL:** `[YOUR_PRODUCTION_DOMAIN]/api`
- **Authentication:** `POST /api/admin/login`
  - Body: `{ "username": "admin", "password": "your_password" }`
  - Returns: `{ "success": true, "token": "JWT_TOKEN", "user": { ... } }`
- **Dashboard Summary:** `GET /api/admin/stats`
  - Returns: `{ "total_revenue": 1000, "pending_orders": 5, "total_products": 20 }`
- **Order Management:**
  - `GET /api/orders`: List all orders with nested items.
  - `PATCH /api/orders/[id]`: Update status (`pending`, `shipped`, `completed`).
- **Product Management:**
  - `GET /api/products`: List all inventory.
  - `POST /api/products`: Add new product (Name, Description, Prices for 250g/500g/1kg, Image).
  - `PUT /api/products/[id]`: Update existing product.
- **Image Upload:** `POST /api/upload` (Supports multipart/form-data `file`).

### **3. Key Features & Screens**
1.  **Login Screen:** Secure login screen using the `/api/admin/login` endpoint. Save the JWT token securely (e.g., SecureStore).
2.  **Dashboard Overview:**
    - Display summary cards (Revenue, Pending Orders, Inventory Count).
    - Quick actions to add a new product or view new orders.
3.  **Order Detail View:**
    - List items (Product, Variant, Qty, Price).
    - Customer details with a "Call Customer" button (`tel:` scheme).
    - Change order status directly from the screen.
4.  **Product Management:**
    - List all products with current prices.
    - Form to add/edit products including image upload to Cloudinary via the backend.
5.  **Real-time Notifications:**
    - System notification on the phone when a new order is detected.

### **4. Visual Guidelines**
- **Brand Identity:** Primary: Maroon (`#800000`). Accent: Gold/Yellow.
- **UX:** One-handed use optimization, high contrast for shop conditions, and fast navigation.

---

### **Instructions for the Developer/AI**
"The backend is fully prepared with Next.js 15 and Neon PostgreSQL. All administrative routes for stats, login, and CRUD operations are ready. Your primary task is to build the React Native interface, implement SecureStore for auth tokens, and bridge the backend to Firebase for push notifications. Prioritize a premium, fast user experience."

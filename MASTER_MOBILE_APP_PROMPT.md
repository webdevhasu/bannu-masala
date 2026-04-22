# MASTER PROMPT: Bannu Masala Admin Mobile App (React Native/Expo)

**STRICT INSTRUCTIONS FOR AI DEVELOPER:**
- **Backend:** Do NOT build a new backend. The backend is already built with Next.js 15 and Neon PostgreSQL.
- **Image Storage:** Do NOT use Replit storage or local storage. Use the existing **Cloudinary** integration via the `/api/upload` endpoint.
- **Database:** Do NOT create new tables. Use the existing `orders`, `order_items`, and `products` tables.
- **Auth:** Use the existing `/api/admin/login` (JWT) logic.

---

### **1. Project Overview**
You are building a premium **React Native (Expo)** mobile application for the admin of "Bannu Masala". The app must be high-performance, secure, and visually stunning using the brand's primary colors (Maroon #800000 and Gold).

### **2. API & Integration Specs**
**Base URL:** `[YOUR_PRODUCTION_DOMAIN]/api` 

**Endpoints:**
- **Login:** `POST /admin/login` (Body: `username`, `password`). Returns JWT `token`.
- **Stats:** `GET /admin/stats` (Returns: `total_revenue`, `pending_orders`, `total_products`).
- **Orders:** `GET /orders` (List with nested items) and `PATCH /orders/[id]` (Update status to `shipped` or `completed`).
- **Inventory:** `GET /products`, `POST /products` (Add), `PUT /products/[id]` (Update), `DELETE /products/[id]`.
- **Image Upload:** `POST /upload` (Multipart/form-data. Key: `file`. Returns Cloudinary `url`).

### **3. Mobile App Features**
1. **Dashboard Home:** 
   - Premium cards showing Stats from `/api/admin/stats`.
   - Visual charts or progress bars for monthly targets.
2. **Orders Management:**
   - Tabbed navigation: New Orders vs Past Orders.
   - Detail view with purchased items and direct "Call Customer" button (`tel:`).
3. **Product Inventory:**
   - Full list with search/filter.
   - Form to add new products including local image picker that uploads to Cloudinary via the backend.
4. **Notifications:**
   - Setup Firebase (FCM) to listen for new order triggers.

### **4. Visual Guidelines**
- Use **NativeWind** for styling.
- Modern, clean, and "Spicy" brand aesthetic.
- Dark mode support is a plus but prioritize a clean Light/Luxury mode.

### **5. Implementation Workflow**
Step 1: Setup project with Expo Router and Axios.
Step 2: Implement Auth flow and persist JWT using `expo-secure-store`.
Step 3: Build the Stats Dashboard and Orders list.
Step 4: Build the Product Management forms with image upload.
Step 5: Final polish and error handling.

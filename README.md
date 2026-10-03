# SajiloKinmel 🛒

**SajiloKinmel** is a full-stack grocery e-commerce web application built using the **MERN Stack**. It provides a complete platform for buyers, sellers, and administrators to manage products, stores, orders, payments, and communication.

## 🚀 Features

### 👤 Buyer

* Register, Login & Email Verification
* Browse, Search & Filter Products
* Cart & Wishlist
* Product Ratings & Reviews
* Address Management
* Order Placement & Order History
* COD & eSewa Payment
* Real-time Chat & Notifications

### 🏪 Seller

* Seller Request & Admin Approval
* Store Management
* Product Management
* Order Management
* Customer Chat
* Notifications

### 🛡️ Admin

* Dashboard & Analytics
* User Management
* Seller Approval/Rejection
* Store & Product Management
* Order & Payment Management

---

## 🛠️ Tech Stack

### Frontend

* React + Vite
* Tailwind CSS
* shadcn/ui
* Lucide React
* Framer Motion
* Recharts
* Axios
* Socket.IO Client

### Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* JWT Authentication
* bcrypt
* Cloudinary
* Nodemailer
* Socket.IO
* eSewa

---

## 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │       USER          │
                         │ Buyer / Seller /    │
                         │       Admin         │
                         └──────────┬──────────┘
                                    │
                                    ▼
                    ┌───────────────────────────┐
                    │       React + Vite        │
                    │    Frontend Application   │
                    └─────────────┬─────────────┘
                                  │
                         Axios / Socket.IO
                                  │
                                  ▼
                    ┌───────────────────────────┐
                    │       Express.js API      │
                    │ Routes → Controllers      │
                    │ Middleware → Services     │
                    └─────────────┬─────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
       ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
       │   MongoDB   │    │  Cloudinary │    │   eSewa     │
       │  Database   │    │    Images   │    │   Payment   │
       └─────────────┘    └─────────────┘    └─────────────┘
                                  │
                                  ▼
                         ┌────────────────┐
                         │   Socket.IO    │
                         │ Chat & Alerts  │
                         └────────────────┘
```

---

# 📁 Project Structure

## Backend

```text
Backend/
├── src/
│   ├── config/
│   │   ├── cloudinary.js
│   │   └── database.js
│   │
│   ├── controllers/
│   │   ├── address.controller.js
│   │   ├── admin.controller.js
│   │   ├── adminSeller.controller.js
│   │   ├── auth.controller.js
│   │   ├── cart.controller.js
│   │   ├── category.controller.js
│   │   ├── chat.controller.js
│   │   ├── notification.controller.js
│   │   ├── order.controller.js
│   │   ├── orderManagement.controller.js
│   │   ├── payment.controller.js
│   │   ├── product.controller.js
│   │   ├── productComment.controller.js
│   │   ├── productRating.controller.js
│   │   ├── review.controller.js
│   │   ├── seller.controller.js
│   │   ├── store.controller.js
│   │   ├── user.controller.js
│   │   └── wishlist.controller.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── rateLimitMiddleware.js
│   │   ├── role.middleware.js
│   │   ├── upload.middleware.js
│   │   └── validationMiddleware.js
│   │
│   ├── models/
│   │   ├── address.model.js
│   │   ├── cart.model.js
│   │   ├── category.model.js
│   │   ├── conversation.model.js
│   │   ├── emailVerification.model.js
│   │   ├── message.model.js
│   │   ├── notification.model.js
│   │   ├── order.model.js
│   │   ├── passwordResetModel.js
│   │   ├── payment.model.js
│   │   ├── product.model.js
│   │   ├── productComment.model.js
│   │   ├── productCommentReaction.model.js
│   │   ├── productRating.model.js
│   │   ├── review.model.js
│   │   ├── sellerRequest.model.js
│   │   ├── session.model.js
│   │   ├── store.model.js
│   │   ├── user.model.js
│   │   └── wishlist.model.js
│   │
│   ├── routes/
│   │   ├── address.routes.js
│   │   ├── admin.route.js
│   │   ├── auth.route.js
│   │   ├── cart.route.js
│   │   ├── category.route.js
│   │   ├── chat.routes.js
│   │   ├── health.route.js
│   │   ├── notification.routes.js
│   │   ├── order.route.js
│   │   ├── orderManagement.routes.js
│   │   ├── payment.route.js
│   │   ├── product.route.js
│   │   ├── productComment.route.js
│   │   ├── productRating.route.js
│   │   ├── review.routes.js
│   │   ├── seller.routes.js
│   │   ├── store.routes.js
│   │   ├── user.route.js
│   │   └── wishlist.route.js
│   │
│   ├── services/
│   │   └── esewa.service.js
│   │
│   ├── utils/
│   │   ├── cloudinary.util.js
│   │   ├── esewa.util.js
│   │   ├── mailer.js
│   │   ├── notification.util.js
│   │   ├── orderStock.util.js
│   │   └── tokenUtils.js
│   │
│   ├── validators/
│   │   ├── addressValidator.js
│   │   ├── authValidator.js
│   │   ├── orderValidator.js
│   │   ├── reviewValidator.js
│   │   └── userValidator.js
│   │
│   ├── app.js
│   └── server.js
│
├── .gitignore
├── package-lock.json
└── package.json
```

---

## Frontend

```text
Frontend/
├── public/
│
├── src/
│   ├── api/
│   │   ├── address.api.js
│   │   ├── admin.api.js
│   │   ├── auth.api.js
│   │   ├── axiosClient.js
│   │   ├── cart.api.js
│   │   ├── category.api.js
│   │   ├── chat.api.js
│   │   ├── notification.api.js
│   │   ├── order.api.js
│   │   ├── orderManagement.api.js
│   │   ├── payment.api.js
│   │   ├── product.api.js
│   │   ├── productComment.api.js
│   │   ├── productRating.api.js
│   │   ├── review.api.js
│   │   ├── seller.api.js
│   │   ├── store.api.js
│   │   ├── user.api.js
│   │   └── wishlist.api.js
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   ├── product/
│   │   └── ui/
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   ├── NotificationContext.jsx
│   │   └── WishlistContext.jsx
│   │
│   ├── lib/
│   │   └── utils.js
│   │
│   ├── pages/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── buyer/
│   │   ├── seller/
│   │   └── NotFoundPage.jsx
│   │
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── .gitignore
├── README.md
├── index.html
├── package-lock.json
├── package.json
└── vite.config.js
```

---

## 💳 Payment

SajiloKinmel supports:

* **Cash on Delivery (COD)**
* **eSewa**

---

## ⚙️ Installation

```bash
# Clone repository
git clone <repository-url>

# Backend
cd Backend
npm install
npm run dev

# Frontend
cd Frontend
npm install
npm run dev
```

Configure the required environment variables for **MongoDB, JWT, Cloudinary, Nodemailer, and eSewa**.

---

## 📌 Project

**SajiloKinmel — MERN Stack Grocery E-Commerce Platform**

Developed as a college project to demonstrate full-stack development, e-commerce functionality, authentication, role-based access control, real-time communication, and online payment integration.

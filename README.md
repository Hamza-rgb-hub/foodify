# 🍔 Foodify — Full-Stack Food Delivery App

A production-ready MERN stack food delivery platform with role-based access, Stripe payments, real-time order tracking, and modern UI.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, Tailwind CSS, Framer Motion, Redux Toolkit |
| Backend | Node.js, Express.js, MongoDB + Mongoose |
| Auth | JWT + bcrypt, role-based access control |
| Payments | Stripe (card) + Cash on Delivery |
| Images | Multer (local) / Cloudinary (cloud) |

## 📁 Project Structure

```
food-delivery/
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── pages/           # Route-level pages
│       ├── store/           # Redux slices
│       └── utils/           # API client, helpers
└── server/                  # Express backend
    ├── controllers/         # Request handlers
    ├── middleware/          # Auth, upload middleware
    ├── models/              # Mongoose schemas
    ├── routes/              # API routes
    └── seed.js              # Database seeder
```

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Stripe account (for payments)

## 🌟 Features

### User Role
- Browse & search food with category filters
- View restaurant shops
- Add to cart, adjust quantities
- Checkout with Stripe or Cash on Delivery
- Order history with real-time status tracking
- Cancel orders (within allowed window)
- Light/dark mode

### Food Partner Role
- Create restaurant profile (pending admin approval)
- Add/edit/delete food items with images
- Toggle item availability
- Manage orders with status updates
- Dashboard with revenue & order analytics

### Admin Role
- Full platform dashboard with KPIs
- Approve/reject partner applications
- Block/unblock users
- View and filter all orders
- Manage food categories

## 🔐 Environment Variables

### Server (`server/.env`)

### Client (`client/.env`)

## 🚢 Deployment

### Database → MongoDB Atlas
1. Create cluster at cloud.mongodb.com
2. Whitelist IP addresses
3. Copy connection string to MONGODB_URI

## 🛠 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | — | Register user |
| POST | /api/auth/login | — | Login |
| GET | /api/auth/me | ✓ | Get current user |
| GET | /api/food | — | List food (with filters) |
| POST | /api/food | Partner | Add food item |
| GET | /api/partners | — | List restaurants |
| GET | /api/cart | User | Get cart |
| POST | /api/cart/add | User | Add to cart |
| POST | /api/orders | User | Place order |
| GET | /api/orders/my-orders | User | Order history |
| PUT | /api/orders/:id/status | Partner | Update status |
| GET | /api/admin/dashboard | Admin | Platform stats |

## 📱 Mobile-First Design

- Fully responsive from 320px to 4K
- Touch-friendly controls
- Optimized image loading
- Smooth Framer Motion animations

## 🎨 Design System

- **Colors**: Orange 500 primary, Rose 500 accent
- **Fonts**: Playfair Display (headings), DM Sans (body)
- **Dark mode**: Full dark mode support with `class` strategy
- **Components**: Custom Tailwind component classes (`btn-primary`, `card`, `input`, etc.)

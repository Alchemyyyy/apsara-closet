# 🌟 Apsara Closet - AI-Powered Fashion E-Commerce Platform

> **Bachelor's Degree Thesis Project**  
> An intelligent fashion e-commerce platform with AI-powered visual search, gender-based personalization, and comprehensive admin analytics.

---

## 📋 **Table of Contents**
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features Completed](#features-completed-✅)
- [Features In Progress](#features-in-progress-🚧)
- [Features Planned](#features-planned-📅)
- [AI/ML Features](#aiml-features-🤖)
- [Installation Guide](#installation-guide)
- [Project Timeline](#project-timeline)

---

## 🎯 **Project Overview**

Apsara Closet is a modern fashion e-commerce platform that leverages artificial intelligence to enhance the shopping experience. The platform features visual search capabilities using deep learning, personalized recommendations, and gender-specific product categorization.

**Key Differentiators:**
- 🤖 AI-powered visual product search using MobileNetV2
- 👔👗 Gender-based product categorization and personalization
- 🎨 1280-dimensional feature extraction for accurate similarity matching
- 📊 Real-time admin analytics with business intelligence
- ⭐ Comprehensive review system with image uploads

---

## 🛠️ **Tech Stack**

### **Frontend** (Vue 3 + Vite)
- **Framework:** Vue 3 (Composition API)
- **Routing:** Vue Router 4
- **State Management:** Pinia
- **Styling:** Tailwind CSS 4
- **UI Components:** Headless UI, Heroicons
- **Form Validation:** VeeValidate + Yup
- **HTTP Client:** Axios
- **Charts:** Chart.js

### **Backend** (Node.js + Express)
- **Runtime:** Node.js 24.x
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Authentication:** JWT + bcrypt
- **File Upload:** Multer
- **Security:** Helmet, CORS
- **Logging:** Morgan

### **AI Service** (Python + FastAPI)
- **Framework:** FastAPI
- **ML Library:** TensorFlow 2.15 (Metal optimized for M1/M2)
- **Model:** MobileNetV2 (ImageNet pre-trained)
- **Image Processing:** Pillow, NumPy
- **Similarity:** scikit-learn (cosine similarity)
- **Async:** aiohttp

### **DevOps & Tools**
- **Version Control:** Git
- **Package Managers:** npm (Node), pip (Python)
- **Environment:** dotenv
- **Development:** Nodemon, Vite HMR
- **Database GUI:** Prisma Studio

---

## ✅ **Features Completed**

### **🔐 Authentication & Authorization**
- ✅ User registration with email/password
- ✅ Secure login with JWT tokens
- ✅ Password hashing with bcrypt
- ✅ Protected routes (frontend + backend)
- ✅ Role-based access control (User/Admin)
- ✅ User profile management
- ✅ Profile photo upload (pending)
- ✅ Password reset (pending email integration)

### **🛍️ Product Management**
- ✅ Product CRUD operations (Admin)
- ✅ Product listing with pagination
- ✅ Product detail page with variants
- ✅ Multiple image upload per product
- ✅ Category management
- ✅ Size and color variants
- ✅ Stock tracking
- ✅ Product status (active/inactive)
- ✅ View counter
- ⚠️ Gender-based categorization (in progress)

### **🛒 Shopping Experience**
- ✅ Shopping cart functionality
- ✅ Add/remove/update cart items
- ✅ Cart persistence (localStorage + database)
- ✅ Quantity management with stock validation
- ✅ Cart count badge in navbar
- ✅ Cart total calculation
- ⚠️ Checkout flow (basic - needs payment integration)

### **❤️ Wishlist System**
- ✅ Add/remove products from wishlist
- ✅ Wishlist page with product grid
- ✅ Wishlist count in navbar
- ✅ Move items from wishlist to cart
- ✅ Wishlist persistence
- ✅ Heart icon toggle on products

### **⭐ Review & Rating System**
- ✅ 5-star rating system
- ✅ Write reviews with title and comment
- ✅ Upload up to 5 images per review
- ✅ Verified purchase badge
- ✅ Helpful button counter
- ✅ Edit/delete own reviews
- ✅ Rating distribution chart
- ✅ Automatic product rating calculation
- ✅ Review pagination and sorting

### **🤖 AI-Powered Visual Search**
- ✅ Image upload for product search
- ✅ Feature extraction using MobileNetV2
- ✅ 1280-dimensional embeddings
- ✅ Cosine similarity matching
- ✅ Top-K similar product results
- ✅ Similarity percentage display
- ✅ Backend feature extraction API
- ✅ Batch feature extraction for products
- ✅ M1/M2 GPU acceleration (TensorFlow Metal)
- ⚠️ Gender filter for visual search (planned)

### **📊 Admin Dashboard**
- ✅ Overview stats (Revenue, Orders, Customers, Products)
- ✅ Revenue tracking with % change
- ✅ Sales chart (7/30/90 day views)
- ✅ Top selling products
- ✅ Recent orders table
- ✅ Customer statistics
- ✅ Low stock alerts
- ⚠️ Order status management (basic)
- ⚠️ Advanced analytics (in progress)

### **🎨 UI/UX**
- ✅ Responsive design (mobile-friendly)
- ✅ Clean, modern interface
- ✅ Loading states
- ✅ Error handling
- ✅ Toast notifications (basic)
- ✅ Form validation
- ✅ Image galleries
- ⚠️ Dark mode (planned)
- ⚠️ Animations & transitions (basic)

---

## 🚧 **Features In Progress**

### **👔👗 Gender-Based System**
- 🚧 Add gender field to products
- 🚧 Gender selection in navbar (Men/Women)
- 🚧 Gender-specific product filtering
- 🚧 Gender-based visual search filtering
- 🚧 Personalized recommendations by gender
- 🚧 Gender-specific homepage sections

### **📦 Order Management**
- 🚧 Complete checkout flow
- 🚧 Address management (CRUD)
- 🚧 Multiple shipping options
- 🚧 Order tracking system
- 🚧 Order status updates (email notifications)
- 🚧 Order history for users
- 🚧 Invoice generation (PDF)
- 🚧 Cancel/return order flow

### **💳 Payment Integration**
- 🚧 Payment gateway integration (Stripe/PayPal)
- 🚧 Multiple payment methods
- 🚧 Payment status tracking
- 🚧 Refund management
- 🚧 Save payment methods

---

## 📅 **Features Planned**

### **🎁 Promotions & Discounts**
- 📅 Coupon code system
- 📅 Discount management (Admin)
- 📅 Flash sales
- 📅 Bundle offers
- 📅 Loyalty points
- 📅 First-time buyer discount

### **🔍 Enhanced Search & Discovery**
- 📅 Text-based product search
- 📅 Advanced filters (price range, brand, etc.)
- 📅 Sort options (price, rating, new, popular)
- 📅 Recently viewed products
- 📅 "Customers also bought" recommendations
- 📅 Trending products
- 📅 New arrivals section

### **🤖 AI Enhancements**
- 📅 **For Users:** AI product recommendations based on:
  - Browsing history
  - Purchase history
  - Similar user preferences
  - Wishlist items
  - Visual search history
- 📅 **Smart Filters:** AI suggests relevant filters based on user behavior
- 📅 **Size Recommendation:** AI predicts user's size based on previous purchases
- 📅 **Style Matching:** "Complete the look" suggestions
- 📅 **Seasonal Recommendations:** AI suggests products based on season/weather
- 📅 **Price Alert:** Notify when wishlist items go on sale

### **📧 Email System**
- 📅 Email verification on signup
- 📅 Order confirmation emails
- 📅 Shipping update emails
- 📅 Password reset emails
- 📅 Abandoned cart recovery
- 📅 Promotional newsletters
- 📅 Wishlist price drop alerts

### **📱 User Experience**
- 📅 Push notifications
- 📅 Live chat support
- 📅 FAQ section
- 📅 Size guide
- 📅 Product comparison
- 📅 Social sharing
- 📅 Product availability alerts
- 📅 Multi-language support

### **📊 Advanced Admin Features**
- 📅 Customer segmentation
- 📅 Email marketing campaigns
- 📅 Inventory forecasting (AI)
- 📅 Automated restock alerts
- 📅 Sales forecasting
- 📅 Customer lifetime value analysis
- 📅 A/B testing dashboard
- 📅 Export reports (PDF/CSV/Excel)

### **🔒 Security & Compliance**
- 📅 Two-factor authentication (2FA)
- 📅 Rate limiting
- 📅 GDPR compliance
- 📅 Terms of Service
- 📅 Privacy Policy
- 📅 Cookie consent

### **🚀 Performance**
- 📅 Image optimization (CDN)
- 📅 Lazy loading
- 📅 Caching strategy (Redis)
- 📅 Database query optimization
- 📅 API response compression
- 📅 FAISS for faster similarity search

---

## 🤖 **AI/ML Features**

### **Visual Search Pipeline**
```
User Upload Image
    ↓
Image Preprocessing (224x224, RGB normalization)
    ↓
MobileNetV2 Feature Extraction (1280-dim vector)
    ↓
Cosine Similarity Comparison
    ↓
Top-K Similar Products
    ↓
Results with Similarity Score
```

### **AI Insights for Users** (Planned)
1. **Smart Search Suggestions:**
   - "People who searched for this also searched for..."
   - "Complete your outfit with..."
   
2. **Personalized Recommendations:**
   - "Based on your wishlist"
   - "Recommended for you"
   - "Similar to what you viewed"
   
3. **Size Recommendations:**
   - AI predicts best size based on user's purchase history
   
4. **Style Matching:**
   - Upload a photo, get complete outfit suggestions
   
5. **Seasonal Suggestions:**
   - AI recommends products based on current season

### **Model Performance**
- **Model:** MobileNetV2 (ImageNet pre-trained)
- **Feature Vector Size:** 1280 dimensions
- **Similarity Metric:** Cosine similarity
- **Accuracy:** ~85% for similar products (to be benchmarked)
- **Speed:** <500ms per search query
- **GPU Acceleration:** Yes (TensorFlow Metal on M1/M2)

---

## 📦 **Installation Guide**

### **Prerequisites**
- Node.js 18+ (Backend)
- Python 3.11 (AI Service)
- PostgreSQL 14+
- npm or yarn

### **1. Clone Repository**
```bash
git clone https://github.com/yourusername/apsara-closet.git
cd apsara-closet
```

### **2. Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Configure DATABASE_URL, JWT_SECRET in .env
npx prisma generate
npx prisma migrate dev
npm run dev
```

### **3. AI Service Setup**
```bash
cd ai-service
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

### **4. Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env
# Configure VITE_API_BASE_URL in .env
npm run dev
```

### **5. Extract Product Features**
```bash
# Login as admin, then:
POST http://localhost:3000/api/product-features/extract-all
```

---

## ⏰ **Project Timeline** (5-6 Months)

### **Month 1-2: Foundation & Core Features** ✅ (Mostly Done)
- ✅ Project setup (Frontend, Backend, AI Service)
- ✅ Database schema design
- ✅ Authentication system
- ✅ Basic product management
- ✅ Shopping cart
- ✅ Visual search (basic)

### **Month 3: Gender System & Enhanced Features** 🚧 (Current)
- 🚧 Gender-based categorization
- 🚧 Wishlist (Done ✅)
- 🚧 Review system (Done ✅)
- 🚧 Admin dashboard (Done ✅)
- 🚧 Order management
- 🚧 Payment integration

### **Month 4: AI Enhancements & UX**
- 📅 AI-powered recommendations for users
- 📅 Enhanced visual search with filters
- 📅 Email notifications
- 📅 Advanced product search
- 📅 UI/UX improvements

### **Month 5: Advanced Features & Testing**
- 📅 Promotions & discounts
- 📅 Analytics enhancements
- 📅 Performance optimization
- 📅 Comprehensive testing
- 📅 Bug fixes

### **Month 6: Deployment & Documentation**
- 📅 Docker containerization
- 📅 Production deployment
- 📅 API documentation
- 📅 User guide
- 📅 Thesis documentation
- 📅 Final polish

---

## 📊 **Progress Tracking**

### **Overall Completion: ~55%**

**Backend:** 60% ✅  
**Frontend:** 55% ✅  
**AI Service:** 65% ✅  
**Documentation:** 30% 🚧  

### **Feature Categories:**
- Core E-Commerce: 70% ✅
- AI/ML Features: 60% ✅
- Admin Panel: 55% ✅
- User Experience: 50% 🚧
- Payment & Checkout: 20% 🚧
- Email & Notifications: 10% 📅
- Advanced Features: 15% 📅

---

## 🎓 **Thesis Highlights**

**Technical Innovations:**
- Microservices architecture (3 separate services)
- Transfer learning with MobileNetV2
- Real-time cosine similarity search
- Gender-based AI personalization
- Comprehensive analytics dashboard

**Business Value:**
- Enhanced product discovery through AI
- Improved user experience with visual search
- Data-driven insights for business decisions
- Scalable architecture for growth

---

## 📝 **Notes**

- This README is updated regularly as features are completed
- Check individual service README files for detailed documentation
- See `/docs` folder for architecture diagrams and technical documentation

---

## 👨‍💻 **Author**

**[Your Name]**  
Bachelor's Degree Thesis Project  
[University Name]  
[Year]

---

## 📄 **License**

MIT License

---

**Last Updated:** January 3, 2026  
**Version:** 1.0.0-beta
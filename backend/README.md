# Creative Gift Art — Backend API

Production-ready REST API for the **Creative Gift Art** premium invitation platform, built with Node.js, Express.js, and MongoDB Atlas.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Database Seeding](#database-seeding)
- [API Documentation](#api-documentation)
- [Deployment (Hostinger)](#deployment-hostinger)

---

## Tech Stack

| Layer       | Technology                     |
|-------------|-------------------------------|
| Runtime     | Node.js ≥ 18                  |
| Framework   | Express.js 4                  |
| Database    | MongoDB Atlas + Mongoose 8    |
| Auth        | JWT + bcryptjs                |
| Uploads     | Multer                        |
| Validation  | express-validator             |
| Security    | Helmet, CORS, express-rate-limit |
| Logging     | Morgan                        |
| Process     | PM2 (production)              |

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── templateController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT protection
│   │   ├── errorMiddleware.js     # Centralized error handling
│   │   └── uploadMiddleware.js    # Multer config
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Category.js
│   │   └── Template.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── templateRoutes.js
│   │   ├── uploadRoutes.js
│   │   └── dashboardRoutes.js
│   ├── seeds/
│   │   ├── seed.js                # Master seed
│   │   ├── seedAdmin.js
│   │   └── seedCategories.js
│   ├── utils/
│   │   ├── apiResponse.js         # Standardized responses
│   │   └── slugGenerator.js
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── categoryValidator.js
│   │   └── templateValidator.js
│   └── server.js
├── uploads/
│   └── templates/                 # Uploaded thumbnails
├── .env.example
├── .gitignore
└── package.json
```

---

## Quick Start

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your MongoDB Atlas URI and JWT secret
```

### 3. Seed the database

```bash
npm run seed
```

This creates:
- Admin: `admin@creativegiftart.com` / `Admin@123`
- 8 default categories

### 4. Start the server

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

---

## Environment Variables

| Variable               | Description                            | Default       |
|------------------------|----------------------------------------|---------------|
| `NODE_ENV`             | Environment mode                       | development   |
| `PORT`                 | Server port                            | 5000          |
| `MONGO_URI`            | MongoDB Atlas connection string        | required      |
| `JWT_SECRET`           | JWT signing secret (keep strong!)      | required      |
| `JWT_EXPIRES_IN`       | Token expiry                           | 7d            |
| `CLIENT_URL`           | Frontend URL(s) for CORS               | localhost:3000|
| `MAX_FILE_SIZE`        | Max upload size in bytes               | 5242880 (5MB) |
| `RATE_LIMIT_MAX`       | Max requests per window                | 100           |
| `AUTH_RATE_LIMIT_MAX`  | Max login attempts per window          | 10            |

---

## Database Seeding

```bash
# Seed everything (admin + categories)
npm run seed

# Seed only admin
npm run seed:admin

# Seed only categories
npm run seed:categories
```

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Response Format

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message"
}
```

---

### Authentication

| Method | Endpoint          | Access  | Description        |
|--------|-------------------|---------|--------------------|
| POST   | /auth/login       | Public  | Admin login        |
| GET    | /auth/profile     | Private | Get admin profile  |
| POST   | /auth/logout      | Private | Logout             |

**Login Request:**
```json
{
  "email": "admin@creativegiftart.com",
  "password": "Admin@123"
}
```

**Login Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "...",
      "name": "Creative Gift Art",
      "email": "admin@creativegiftart.com",
      "role": "superadmin"
    }
  }
}
```

All protected routes require:
```
Authorization: Bearer <token>
```

---

### Categories

| Method | Endpoint           | Access  | Description             |
|--------|--------------------|---------|-------------------------|
| GET    | /categories        | Public  | List all categories     |
| GET    | /categories/:id    | Public  | Get category by ID/slug |
| POST   | /categories        | Private | Create category         |
| PUT    | /categories/:id    | Private | Update category         |
| DELETE | /categories/:id    | Private | Delete category         |

**Query params for GET /categories:**
- `?active=true` — filter by active status

**Create/Update body:**
```json
{
  "name": "Wedding",
  "description": "Wedding invitation templates",
  "isActive": true
}
```

---

### Templates

| Method | Endpoint                  | Access  | Description                      |
|--------|---------------------------|---------|----------------------------------|
| GET    | /templates                | Public  | List templates (paginated)       |
| GET    | /templates/featured       | Public  | Get featured templates           |
| GET    | /templates/search?q=...   | Public  | Search templates                 |
| GET    | /templates/:slug          | Public  | Get template + increment views   |
| POST   | /templates                | Private | Create template                  |
| PUT    | /templates/:id            | Private | Update template                  |
| DELETE | /templates/:id            | Private | Delete template                  |

**Query params for GET /templates:**
```
?page=1           default: 1
?limit=12         default: 12 (max: 50)
?sort=latest      options: latest | popular | oldest | az | za
?category=wedding filter by category slug or ID
?featured=true    filter featured only
?type=static      filter by type: static | video | website
?isActive=false   show inactive (admin use)
```

### Create Template

| Method | Endpoint    | Access  | Description     |
|--------|-------------|---------|-----------------|
| POST   | /templates  | Private | Create template |

**Body — Static template:**
```json
{
  "title": "Royal Wedding Card",
  "category": "64a1b2c3d4e5f6789012abcd",
  "type": "static",
  "thumbnail": "/uploads/templates/thumb.jpg",
  "images": ["/uploads/templates/img1.jpg", "/uploads/templates/img2.jpg"],
  "youtubeLink": "",
  "description": "Luxury wedding card template",
  "featured": true,
  "tags": ["royal", "luxury", "traditional"]
}
```

**Body — Video template:**
```json
{
  "title": "Cinematic Wedding Invitation",
  "category": "64a1b2c3d4e5f6789012abcd",
  "type": "video",
  "thumbnail": "/uploads/templates/thumb.jpg",
  "images": [],
  "youtubeLink": "https://youtube.com/shorts/xxxxx",
  "description": "Cinematic video invitation",
  "featured": false,
  "tags": ["cinematic", "video"]
}
```

**Body — Website template:**
```json
{
  "title": "Luxury Wedding Website",
  "category": "64a1b2c3d4e5f6789012abcd",
  "type": "website",
  "thumbnail": "/uploads/templates/site-thumb.jpg",
  "images": [],
  "youtubeLink": "https://youtube.com/shorts/abc123",
  "description": "Live Website: https://example.com",
  "featured": true,
  "tags": ["website", "luxury"]
}
```

> Note: For website templates, the live URL goes inside `description` — there is no separate `websiteUrl` field.

---

### Image Upload

| Method | Endpoint                       | Access  | Description              |
|--------|--------------------------------|---------|--------------------------|
| POST   | /upload/template-image         | Private | Upload single thumbnail  |
| POST   | /upload/template-images        | Private | Upload up to 10 images   |
| DELETE | /upload/:filename              | Private | Delete image             |

**Single upload:** `multipart/form-data`, field name `image`.

**Multiple upload:** `multipart/form-data`, field name `images` (up to 10 files).

Accepted formats: JPEG, PNG, WebP — max 5MB per file.

**Single upload response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "imageUrl": "/uploads/templates/template-uuid.jpg"
  }
}
```

**Multiple upload response:**
```json
{
  "success": true,
  "message": "Images uploaded successfully",
  "data": {
    "images": [
      "/uploads/templates/template-uuid1.jpg",
      "/uploads/templates/template-uuid2.jpg"
    ]
  }
}
```

---

### Dashboard

| Method | Endpoint          | Access  | Description           |
|--------|-------------------|---------|-----------------------|
| GET    | /dashboard/stats  | Private | Get dashboard stats   |

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTemplates": 250,
    "totalCategories": 8,
    "activeCategories": 8,
    "featuredTemplates": 30,
    "totalViews": 15420,
    "totalStaticTemplates": 180,
    "totalVideoTemplates": 50,
    "totalWebsiteTemplates": 20,
    "recentTemplates": [],
    "topViewedTemplates": [],
    "templatesByCategory": []
  }
}
```

---

## Deployment (Hostinger)

### 1. Upload files

Upload the `backend/` folder to your Hostinger Node.js app directory.

### 2. Set environment variables

In Hostinger control panel, set all variables from `.env.example`.

### 3. Install dependencies

```bash
npm install --production
```

### 4. Start with PM2

```bash
pm2 start src/server.js --name creative-gift-art-api
pm2 save
pm2 startup
```

### 5. Seed the database

```bash
npm run seed
```

### Notes
- Ensure MongoDB Atlas IP whitelist includes your Hostinger server IP
- Set `NODE_ENV=production` in production environment
- Uploaded images are served from `/uploads/` as static files
- Configure Hostinger reverse proxy to forward to port 5000

---

## Security

- All admin routes are JWT-protected
- Passwords hashed with bcrypt (12 rounds)
- Rate limiting on all API routes (stricter on login)
- Helmet sets security headers
- CORS restricted to configured origins
- Input validated with express-validator
- Stack traces hidden in production
- Path traversal protection on file deletion
- File type and size validation on uploads

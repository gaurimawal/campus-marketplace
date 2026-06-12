# Campus Marketplace

A production-ready full-stack web application where college students can buy and sell used books, electronics, calculators, lab kits, and other academic items.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  React Frontend │────▶│   API Gateway    │────▶│   Lambda    │
│  (S3 + CDN)     │     │                  │     │  Functions  │
└─────────────────┘     └──────────────────┘     └──────┬──────┘
                                                          │
                                              ┌───────────┴───────────┐
                                              ▼                       ▼
                                        ┌──────────┐           ┌──────────┐
                                        │ DynamoDB │           │    S3    │
                                        │ Listings │           │  Images  │
                                        └──────────┘           └──────────┘
```

## Tech Stack

| Layer    | Technology                                              |
|----------|---------------------------------------------------------|
| Frontend | React, Vite, Tailwind CSS, React Router, Axios          |
| Backend  | AWS Lambda, API Gateway, DynamoDB, S3                   |
| Deploy   | S3 Static Hosting, CloudFront (optional), AWS SAM       |

## Project Structure

```
campusmarketplace/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route pages
│   │   ├── services/         # API client (Axios)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── routes/           # Lazy-loaded routes
│   │   └── utils/            # Helpers and constants
│   └── scripts/              # Deployment scripts
├── backend/                  # AWS Lambda handlers
│   ├── src/
│   │   ├── handlers/         # API endpoint handlers
│   │   └── utils/            # DynamoDB, S3, response helpers
│   └── template.yaml         # AWS SAM infrastructure
├── deployment/               # CloudFront and S3 setup
└── README.md
```

## Features

- **Marketplace Dashboard** — Browse listings in a responsive card grid
- **Search & Filter** — Search by name, filter by category, sort by price
- **Role-Based Login** — Student and Admin roles with JWT authentication
- **Create Listing** — Upload images to S3, store metadata in DynamoDB (authenticated)
- **Edit Listing** — Update details and replace images (owner or admin)
- **Delete Listing** — Remove from DynamoDB and clean up S3 images (owner or admin)
- **Listing Details** — Full product view with seller contact info
- **Admin Dashboard** — Manage user roles and platform access

## Authentication & Roles

| Role    | Permissions                                              |
|---------|----------------------------------------------------------|
| Student | Browse listings, create/edit/delete own listings         |
| Admin   | All student permissions + manage all listings + admin panel |

**Public routes:** Browse listings, view listing details, login, register

**Protected routes:** Create listing, edit listing (owner or admin only)

**Admin routes:** `/admin` — user role management

### Demo Accounts (Local Dev)

| Email              | Password  | Role    |
|--------------------|-----------|---------|
| admin@campus.edu   | admin123  | Admin   |
| (register new)     | —         | Student |

## Local Development

### Prerequisites

- Node.js 20+
- npm
- AWS CLI (for deployment)
- AWS SAM CLI (for backend deployment)

### 1. Start the local API server

```bash
cd backend
npm install
node src/local-server.js
```

The API runs at `http://localhost:3001`.

### 2. Start the frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app runs at `http://localhost:5173`. The default API URL points to `http://localhost:3001`.

## AWS Deployment

### Step 1: Deploy the backend

```bash
cd backend
npm install
sam build
sam deploy --guided
```

Note the **ApiUrl** output from the deployment. It looks like:

```
https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod
```

### Step 2: Configure the frontend

```bash
cd frontend
echo "VITE_API_BASE_URL=https://YOUR_API_URL" > .env
npm install
npm run build
```

### Step 3: Deploy frontend to S3

Create an S3 bucket for static hosting:

```bash
# Linux/macOS
chmod +x deployment/frontend-s3-setup.sh
./deployment/frontend-s3-setup.sh campus-marketplace-frontend-YOUR_ACCOUNT_ID
```

Deploy the build:

```bash
cd frontend
FRONTEND_BUCKET=campus-marketplace-frontend-YOUR_ACCOUNT_ID npm run deploy
```

### Step 4 (Optional): CloudFront CDN

```bash
aws cloudformation deploy \
  --template-file deployment/cloudfront-template.yaml \
  --stack-name campus-marketplace-cdn \
  --parameter-overrides FrontendBucketName=campus-marketplace-frontend-YOUR_ACCOUNT_ID
```

## API Endpoints

### Auth

| Method | Endpoint                  | Auth     | Description              |
|--------|---------------------------|----------|--------------------------|
| POST   | `/auth/register`          | Public   | Register as student      |
| POST   | `/auth/login`             | Public   | Login, returns JWT       |
| GET    | `/auth/me`                | Required | Get current user profile |
| GET    | `/auth/users`             | Admin    | List all users           |
| PUT    | `/auth/users/{id}/role`   | Admin    | Update user role         |

### Listings

| Method | Endpoint           | Auth              | Description          |
|--------|--------------------|-------------------|----------------------|
| GET    | `/listings`        | Public            | Fetch all listings   |
| GET    | `/listings/{id}`   | Public            | Fetch one listing    |
| POST   | `/listings`        | Student/Admin     | Create listing       |
| PUT    | `/listings/{id}`   | Owner/Admin       | Update listing       |
| DELETE | `/listings/{id}`   | Owner/Admin       | Delete listing       |
| POST   | `/upload`          | Student/Admin     | Upload image to S3   |

## DynamoDB Schema

**Table:** `Listings`

| Attribute    | Type   | Description          |
|-------------|--------|----------------------|
| listingId   | String | Partition Key (UUID) |
| productName | String | Product title        |
| category    | String | Books, Electronics…  |
| price       | Number | Price in USD         |
| description | String | Item description     |
| contact     | String | Seller phone number  |
| imageUrl    | String | S3 image URL         |
| sellerId    | String | Owner user ID        |
| sellerName  | String | Owner display name   |
| createdAt   | String | ISO timestamp        |

**Table:** `Users`

| Attribute    | Type   | Description                    |
|-------------|--------|--------------------------------|
| userId      | String | Partition Key (UUID)           |
| email       | String | GSI — unique login email       |
| passwordHash| String | Bcrypt hashed password         |
| name        | String | Display name                   |
| role        | String | `student` or `admin`           |
| createdAt   | String | ISO timestamp                  |

## Environment Variables

### Frontend (`.env`)

| Variable            | Description              |
|---------------------|--------------------------|
| `VITE_API_BASE_URL` | API Gateway endpoint URL |



| Variable         | Description                    |
|------------------|--------------------------------|
| `LISTINGS_TABLE` | DynamoDB listings table name   |
| `USERS_TABLE`    | DynamoDB users table name      |
| `IMAGES_BUCKET`  | S3 bucket for images           |
| `JWT_SECRET`     | Secret for signing JWT tokens  |





link = http://campus-marketplace-frontend2026.s3-website-us-east-1.amazonaws.com/

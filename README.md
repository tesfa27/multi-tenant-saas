# Multi-Tenant SaaS Platform

A modern, scalable multi-tenant application built with **Next.js 15+**, **Prisma**, and **PostgreSQL**. Featuring robust authentication, basic tenant isolation, and a sleek UI.

## 🚀 Features

-   **🏢 Multi-Tenancy**: Full tenant isolation with slug-based routing (`/tenant-name/dashboard`).
-   **🔐 Advanced Authentication**:
    -   Secure Email/Password Login.
    -   **Google OAuth 2.0**: Integrated with strict tenant resolution.
    -   **Magic Links**: Passwordless login via email.
    -   **Role-Based Access Control (RBAC)**: Tenant ownership and membership rules.
    -   **JWT Sessions**: Secure, HTTP-only cookie-based session management with Refresh Tokens.
-   **📧 Email System**: Transactional emails powered by **Resend** and **React Email**.
-   **⚡ Real-time & Caching**: **Redis** integration for high-performance data caching and OTP storage.
-   **🎨 Modern UI**: Built with **Tailwind CSS v4** and **Radix UI** primitives for accessibility and design.
-   **🛡️ Type Safety**: End-to-end type safety with **TypeScript** and **Zod**.

## 🛠️ Technology Stack

-   **Framework**: [Next.js App Router](https://nextjs.org/) (React 19)
-   **Database**: PostgreSQL & Prisma ORM
-   **State Management**: TanStack Query v5
-   **Authentication**: Custom JWT & OAuth
-   **Styling**: Tailwind CSS 4 & Lucide Icons
-   **Forms**: React Hook Form & Zod
-   **Infrastructure**: Docker Compose (Postgres, Redis)

## ⚡ Getting Started

### Prerequisites
-   Node.js 20+
-   Docker (for local database & redis)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/multi-tenant-saas.git
    cd multi-tenant-saas
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start Services (DB & Redis):**
    ```bash
    docker-compose up -d
    ```

4.  **Configure Environment Variables:**
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/saas_dev"
    REDIS_URL="redis://localhost:6379"
    
    # Auth Secrets
    JWT_ACCESS_SECRET="your-access-secret"
    JWT_REFRESH_SECRET="your-refresh-secret"
    
    # Google OAuth
    GOOGLE_CLIENT_ID="your-google-client-id"
    GOOGLE_CLIENT_SECRET="your-google-client-secret"
    
    # App Config
    NEXT_PUBLIC_APP_URL="http://localhost:3000"
    
    # Email (Resend)
    RESEND_API_KEY="re_..."
    ```

5.  **Run Migrations:**
    ```bash
    npx prisma migrate dev
    ```

6.  **Start Development Server:**
    ```bash
    npm run dev
    ```

Visit `http://localhost:3000` to begin.

## 📂 Project Structure

-   `app/[tenant]`: Tenant-scoped routes and layouts.
-   `app/api/auth`: Global authentication endpoints (OAuth callbacks).
-   `lib/`: Shared utilities (Prisma client, Auth helpers, Redis).
-   `components/`: Reusable UI components (Auth forms, Buttons).
-   `prisma/`: Database schema and migrations.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

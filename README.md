# Goodstock-X E-Commerce Platform

A modern e-commerce platform built with Next.js 14, Tailwind CSS, and Supabase.

## 🚀 Features

### Customer Features
- **Product Catalog**: Browse shoes, bags, and clothing
- **Search & Filter**: Advanced search with multiple filters
- **Shopping Cart**: Add products with size/color selection
- **Wishlist**: Save favorite products
- **User Authentication**: Register, login, profile management
- **WhatsApp Integration**: Direct checkout via WhatsApp

### Admin Features
- **Admin Dashboard**: Overview of products and statistics
- **Product Management**: Full CRUD operations for products
- **Image Upload**: Multiple image upload with Supabase Storage
- **Promo Management**: Toggle promotional status
- **User Management**: Role-based access control

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, ShadCN/UI Components
- **Backend**: Supabase (Database, Auth, Storage)
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Deployment**: Netlify

## 📦 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd goodstock-x
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://eldhtxtnwdanyavkikap.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

4. **Set up Supabase Database**
Run the migration files in your Supabase SQL editor:
- `supabase/migrations/create_profiles_table.sql`
- `supabase/migrations/create_products_table.sql`
- `supabase/storage/create_buckets.sql`

5. **Create Admin User**
In Supabase Auth dashboard:
- Create a new user
- Update the user's profile in the `profiles` table with `role = 'admin'`

6. **Run the development server**
```bash
npm run dev
```

## 🗄️ Database Schema

### Profiles Table
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL,
  full_name text,
  phone text,
  role text CHECK (role IN ('admin', 'customer')) DEFAULT 'customer',
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);
```

### Products Table
```sql
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('sepatu', 'tas', 'pakaian')),
  subcategory text NOT NULL,
  brand text NOT NULL,
  price numeric NOT NULL,
  discount numeric CHECK (discount >= 0 AND discount <= 100),
  stock integer NOT NULL DEFAULT 0,
  sizes text[] NOT NULL,
  gender text NOT NULL CHECK (gender IN ('pria', 'wanita', 'unisex')),
  promo boolean DEFAULT false,
  images text[] DEFAULT '{}',
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);
```

## 🔐 Authentication

### Customer Authentication
- **Register**: `/auth/register`
- **Login**: `/auth/login`
- **Forgot Password**: `/auth/forgot-password`
- **Profile**: `/akun`

### Admin Authentication
- **Admin Login**: `/admin/login`
- **Admin Dashboard**: `/admin/dashboard`
- **Product Management**: `/admin/products`

## 📱 Pages Structure

### Public Pages
- `/` - Homepage with featured products
- `/kategori` - All categories
- `/kategori/[slug]` - Category products with filters
- `/produk/[id]` - Product detail page
- `/search` - Search results
- `/cart` - Shopping cart
- `/wishlist` - User wishlist

### Auth Pages
- `/auth/login` - Customer login
- `/auth/register` - Customer registration
- `/auth/forgot-password` - Password reset

### Admin Pages
- `/admin/login` - Admin login
- `/admin/dashboard` - Admin overview
- `/admin/products` - Product management
- `/admin/products/add` - Add new product

## 🎨 UI Components

Built with ShadCN/UI components:
- Forms with validation
- Data tables with sorting/filtering
- Modal dialogs and drawers
- Toast notifications
- Loading states and skeletons

## 📦 Deployment

The app is configured for deployment on Netlify:

```bash
npm run build
```

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Run the migration SQL files
3. Set up authentication providers
4. Create storage bucket for product images
5. Configure RLS policies

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
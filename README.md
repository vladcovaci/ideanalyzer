# 🚀 StartupKit - Production Ready SaaS Starter

StartupKit is a complete, production-ready SaaS starter built with Next.js 15, TypeScript, Stripe, and Prisma. Ship your SaaS product faster with authentication, payments, subscriptions, dashboards, and more - all pre-built and ready to customize.

## ✨ Features

### 🔐 Complete Authentication System
- **NextAuth.js** with multiple providers
  - Email/Password authentication
  - Google OAuth integration
  - Email verification required
  - Password reset flow
  - Secure session management with JWT
- User onboarding flow
- Protected routes with middleware
- Profile management

### 💳 Stripe Integration (Production Ready)
- **Subscription Management**
  - Multiple pricing tiers (Starter $29, Growth $79, Scale $149)
  - **14-day free trial** on all paid plans
  - Automatic recurring billing
  - Proration on plan changes
  - Cancel anytime
- **Customer Portal**
  - Self-service subscription management
  - Update payment methods
  - View and download invoices
  - Upgrade/downgrade plans
- **Webhook Integration**
  - Real-time subscription sync
  - Automatic database updates
  - Payment event handling
- **Tier-Based Features**
  - Free: Basic dashboard (100 API calls, 1 GB, 1 project)
  - Starter: Analytics, Projects (10K API calls, 10 GB, 5 projects)
  - Growth: Team, Advanced Analytics (100K API calls, 100 GB, 20 projects)
  - Scale: Everything unlimited + SSO

### 📊 Complete Dashboard
- Main Dashboard with charts and metrics
- Analytics Dashboard (Growth+)
- Projects Management (Starter+)
- Team Collaboration (Growth+)
- Usage Tracking & Limits
- Account Settings
- Billing & Invoices
- Support Portal

### 📧 Email System (Resend)
- Welcome emails
- Email verification
- Password reset
- Subscription confirmations
- Invoice receipts
- Support acknowledgments
- Beautiful HTML templates
- Development mode (console logging)

### 🗄️ Database & ORM
- MongoDB with Prisma
- User management
- Subscription tracking
- Usage records
- Type-safe queries

### 🎨 Beautiful UI
- **shadcn/ui** components (40+ components)
- **Tailwind CSS** v4
- Dark mode ready
- Fully responsive
- Loading states & error handling
- Toast notifications

## 🏃‍♂️ Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

**Minimum Required** (to run locally without Stripe):

```env
DATABASE_URL="mongodb+srv://..."
NEXTAUTH_SECRET="your-secret"  # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**For Full Stripe Integration** (see [STRIPE_SETUP.md](./STRIPE_SETUP.md)):

```env
# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_STARTER_PRICE_ID="price_..."
STRIPE_GROWTH_PRICE_ID="price_..."
STRIPE_SCALE_PRICE_ID="price_..."
STRIPE_TRIAL_PERIOD_DAYS="14"

# Optional: Enforce subscriptions
ENABLE_SUBSCRIPTION_ENFORCEMENT="false"
```

### 3. Database Setup

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 5. Test Authentication (No Email Setup Needed!)

1. Register at `/register`
2. Visit `/dev-tools` to verify email (development only)
3. Login at `/login`
4. Complete onboarding
5. Access dashboard

## 📦 What's Included

### Pages

**Public**: Landing, Pricing, About, Blog, Services, Contact, FAQ, Legal
**Auth**: Login, Register, Verify Email, Forgot/Reset Password
**Dashboard** (Protected):
- `/dashboard` - Main dashboard
- `/dashboard/onboarding` - One-time setup
- `/dashboard/analytics` - Analytics (Growth+)
- `/dashboard/projects` - Projects (Starter+)
- `/dashboard/team` - Team (Growth+)
- `/dashboard/account` - Profile
- `/dashboard/settings` - Settings tabs
- `/dashboard/billing` - Subscriptions & invoices
- `/dashboard/usage` - Usage limits
- `/dashboard/support` - Support form
- `/dashboard/notifications` - Notifications

### API Routes

- `/api/auth/*` - NextAuth endpoints
- `/api/stripe/checkout` - Create checkout
- `/api/stripe/portal` - Customer portal
- `/api/stripe/webhook` - Webhooks
- `/api/user/*` - Profile, password, onboarding
- `/api/support` - Support tickets

## 🎯 Subscription Tiers & Features

| Feature | Free | Starter | Growth | Scale |
|---------|------|---------|--------|-------|
| **Price** | $0 | **$29/mo** | **$79/mo** | **$149/mo** |
| **Free Trial** | - | ✅ 14 days | ✅ 14 days | ✅ 14 days |
| API Calls | 100/mo | 10K/mo | 100K/mo | Unlimited |
| Storage | 1 GB | 10 GB | 100 GB | Unlimited |
| Projects | 1 | 5 | 20 | Unlimited |
| Team Members | 1 | 3 | 10 | Unlimited |
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Analytics | ❌ | ✅ | ✅ | ✅ |
| Projects | ❌ | ✅ | ✅ | ✅ |
| Team Collaboration | ❌ | ❌ | ✅ | ✅ |
| Advanced Analytics | ❌ | ❌ | ✅ | ✅ |
| API Access | ❌ | ✅ | ✅ | ✅ |
| Webhooks | ❌ | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ❌ | ✅ | ✅ |
| Custom Branding | ❌ | ❌ | ❌ | ✅ |
| SSO | ❌ | ❌ | ❌ | ✅ |

## 🔧 Customization

### Add a New Plan

Edit `src/lib/stripe.ts`:

```typescript
YOUR_PLAN: {
  id: "your-plan",
  name: "Your Plan",
  description: "Description",
  price: 199,
  priceId: process.env.STRIPE_YOUR_PLAN_PRICE_ID,
  trialDays: 14,
  features: { apiCalls: 500000, storage: 500, projects: 50, teamMembers: 50 },
  enabledFeatures: { dashboard: true, analytics: true, /* ... */ },
}
```

### Restrict Features by Tier

```typescript
import { isPlanFeatureEnabled, getUserPlan } from "@/lib/stripe";

const userPlan = getUserPlan(user.stripeSubscriptionId, user.stripePriceId);

if (!isPlanFeatureEnabled(userPlan, "analytics")) {
  return redirect("/dashboard/billing?upgrade=true");
}
```

### Change Trial Period

Update in `.env`:

```env
STRIPE_TRIAL_PERIOD_DAYS="30"  # 30-day trial
```

## 📖 Documentation

- **[STRIPE_SETUP.md](./STRIPE_SETUP.md)** - Complete Stripe setup guide
- **[.env.example](./.env.example)** - All environment variables

## 🧪 Testing Stripe

1. Use test mode keys (`sk_test_`, `pk_test_`)
2. Test card: `4242 4242 4242 4242`
3. Run webhook listener:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 🔐 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB + Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **Email**: Resend
- **UI**: shadcn/ui + Tailwind CSS v4
- **Charts**: Recharts
- **Icons**: Lucide React, Tabler Icons

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

**Production Checklist**:
- [ ] Use live Stripe keys (`sk_live_`, `pk_live_`)
- [ ] Update `NEXT_PUBLIC_APP_URL`
- [ ] Configure production webhook
- [ ] Set `NEXTAUTH_SECRET`
- [ ] Enable Stripe live mode
- [ ] Test subscription flow
- [ ] Monitor webhooks

## 🎨 UI Components

40+ shadcn/ui components included:
Avatar, Badge, Button, Card, Checkbox, Dialog, Dropdown Menu, Input, Label, Progress, Select, Separator, Sheet, Sidebar, Skeleton, Switch, Table, Tabs, Textarea, Toast, Toggle, Tooltip, and more.

## 📝 Project Structure

```
src/
├── app/
│   ├── (auth)/              # Auth pages
│   ├── api/
│   │   ├── auth/           # NextAuth
│   │   ├── stripe/         # Stripe endpoints
│   │   ├── user/           # User management
│   │   └── support/        # Support
│   ├── dashboard/          # Protected pages
│   └── ...                 # Public pages
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── dashboard/          # Dashboard components
│   └── ...
├── lib/
│   ├── auth.ts            # NextAuth config
│   ├── stripe.ts          # Stripe config & helpers
│   ├── db.ts              # Prisma client
│   └── email.ts           # Email templates
└── types/                 # TypeScript types
```

## 🔒 Security

- Environment variable validation
- Webhook signature verification
- Password hashing (bcrypt)
- CSRF protection
- XSS protection
- Secure sessions (JWT)

## 🤝 Contributing

This is a boilerplate - fork and customize for your needs!

## 📄 License

[Your License]

## 🆘 Support

- **Stripe Issues**: See [STRIPE_SETUP.md](./STRIPE_SETUP.md)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma**: [prisma.io/docs](https://prisma.io/docs)

---

**Ship Faster** 🚀 | Built with ❤️ using Next.js, Stripe, and Prisma

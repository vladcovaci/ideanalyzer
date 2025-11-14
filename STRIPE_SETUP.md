# Stripe Integration Setup Guide

This boilerplate includes a complete Stripe integration for subscription management. Follow this guide to set it up.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Stripe Account Setup](#stripe-account-setup)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Webhook Configuration](#webhook-configuration)
- [Testing](#testing)
- [Production Deployment](#production-deployment)

## Prerequisites

- A Stripe account (create one at [stripe.com](https://stripe.com))
- MongoDB database (configured in your .env)
- Resend account for emails (optional, emails will log to console in development)

## Stripe Account Setup

### 1. Get Your API Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers > API keys**
3. Copy your **Publishable key** and **Secret key**
4. Add them to your `.env` file:

```env
STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxxx"
```

### 2. Create Products and Prices

#### Option A: Using Stripe Dashboard (Recommended)

1. Go to **Products** in your Stripe Dashboard
2. Click **+ Add product**
3. Create three products:

**Starter Plan**
- Name: "Starter"
- Description: "For side projects and early validations"
- Price: $29/month (recurring)
- Copy the Price ID (starts with `price_`)

**Growth Plan**
- Name: "Growth"
- Description: "For growing teams"
- Price: $79/month (recurring)
- Copy the Price ID

**Scale Plan**
- Name: "Scale"
- Description: "For enterprise teams"
- Price: $149/month (recurring)
- Copy the Price ID

4. Add the Price IDs to your `.env`:

```env
STRIPE_STARTER_PRICE_ID="price_xxxxxxxxxxxxx"
STRIPE_GROWTH_PRICE_ID="price_xxxxxxxxxxxxx"
STRIPE_SCALE_PRICE_ID="price_xxxxxxxxxxxxx"
```

#### Option B: Using Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Create products
stripe products create --name="Starter" --description="For side projects"
stripe prices create --product=prod_xxx --unit-amount=2900 --currency=usd --recurring=interval:month

# Repeat for other plans
```

### 3. Enable Customer Portal

1. Go to **Settings > Billing > Customer portal**
2. Enable the customer portal
3. Configure the features customers can manage:
   - ✅ Update payment methods
   - ✅ View invoices
   - ✅ Cancel subscriptions
   - ✅ Update subscriptions (optional)

## Database Setup

### 1. Update Prisma Schema

The schema has already been updated with Stripe models. Generate the Prisma client:

```bash
npx prisma generate
npx prisma db push
```

### 2. Verify Database Models

Check that these models were created:
- `User` (updated with Stripe fields)
- `Subscription`
- `UsageRecord`

## Environment Variables

Copy `.env.example` to `.env` and fill in all values:

```bash
cp .env.example .env
```

Required variables for Stripe:

```env
# Stripe API Keys
STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxxx"

# Stripe Webhook (see Webhook Configuration section)
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxx"

# Product/Price IDs
STRIPE_STARTER_PRICE_ID="price_xxxxxxxxxxxxx"
STRIPE_STARTER_PRODUCT_ID="prod_xxxxxxxxxxxxx"
STRIPE_GROWTH_PRICE_ID="price_xxxxxxxxxxxxx"
STRIPE_GROWTH_PRODUCT_ID="prod_xxxxxxxxxxxxx"
STRIPE_SCALE_PRICE_ID="price_xxxxxxxxxxxxx"
STRIPE_SCALE_PRODUCT_ID="prod_xxxxxxxxxxxxx"

# Optional: Trial period
STRIPE_TRIAL_PERIOD_DAYS="14"

# Optional: Subscription enforcement
ENABLE_SUBSCRIPTION_ENFORCEMENT="false"
```

## Webhook Configuration

Webhooks are crucial for keeping subscription status in sync.

### Development (Local Testing)

1. Install Stripe CLI (if not already installed):

```bash
brew install stripe/stripe-cli/stripe
```

2. Login to Stripe CLI:

```bash
stripe login
```

3. Forward webhooks to your local server:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

4. Copy the webhook signing secret (starts with `whsec_`) and add to `.env`:

```env
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxx"
```

5. Keep this terminal running while testing locally

### Production

1. Go to **Developers > Webhooks** in Stripe Dashboard
2. Click **+ Add endpoint**
3. Set endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret and add to your production environment variables

## Testing

### 1. Test Checkout Flow

1. Start your dev server:

```bash
npm run dev
```

2. Register a new account and log in
3. Navigate to `/dashboard/billing`
4. Click "Select" on any plan
5. Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any CVC
   - Any ZIP code

### 2. Test Webhook Events

With Stripe CLI running:

```bash
# Trigger a successful payment
stripe trigger payment_intent.succeeded

# Trigger a subscription created event
stripe trigger customer.subscription.created
```

### 3. Test Customer Portal

1. Subscribe to a plan
2. Go to billing page
3. Click "Manage Subscription"
4. Should open Stripe Customer Portal
5. Test updating payment method, viewing invoices, canceling

### 4. Stripe Test Cards

| Card Number         | Scenario                    |
|--------------------|-----------------------------|
| 4242424242424242   | Success                     |
| 4000000000000002   | Card declined               |
| 4000000000009995   | Insufficient funds          |
| 4000002500003155   | Requires authentication     |

More test cards: [stripe.com/docs/testing](https://stripe.com/docs/testing)

## Features Included

### ✅ Subscription Management
- Create checkout sessions
- Multiple pricing tiers (Starter, Growth, Scale)
- Free trial support
- Automatic subscription sync via webhooks

### ✅ Customer Portal
- Update payment methods
- View and download invoices
- Cancel or update subscriptions
- Managed entirely by Stripe

### ✅ Email Notifications
- Welcome emails
- Subscription confirmation
- Subscription canceled
- Invoice/payment confirmation
- Support request acknowledgment

### ✅ Usage Tracking
- Track API calls, storage, projects, team members
- View usage against plan limits
- Usage alerts (ready for implementation)

### ✅ Subscription Enforcement
- Optional middleware to restrict premium features
- Customizable premium routes
- Graceful upgrade prompts

## API Routes

| Route                          | Method | Description                    |
|-------------------------------|--------|--------------------------------|
| `/api/stripe/checkout`        | POST   | Create checkout session        |
| `/api/stripe/portal`          | POST   | Create portal session          |
| `/api/stripe/webhook`         | POST   | Handle Stripe webhooks         |

## Customization

### Change Plans

Edit `src/lib/stripe.ts`:

```typescript
export const STRIPE_PLANS = {
  // Add or modify plans
  YOUR_PLAN: {
    id: "your-plan",
    name: "Your Plan",
    price: 99,
    priceId: process.env.STRIPE_YOUR_PLAN_PRICE_ID,
    features: {
      apiCalls: 500000,
      storage: 500,
      projects: 50,
      teamMembers: 50,
    },
  },
}
```

### Restrict Features by Plan

Edit `src/middleware.ts`:

```typescript
const PREMIUM_ROUTES = [
  "/dashboard/analytics",
  "/dashboard/projects",
  "/dashboard/team",
  "/dashboard/your-premium-feature", // Add your route
];
```

Then enable enforcement:

```env
ENABLE_SUBSCRIPTION_ENFORCEMENT="true"
```

### Customize Email Templates

Edit `src/lib/email.ts` to customize email designs and content.

## Production Deployment

### 1. Update Environment Variables

Set production environment variables in your hosting platform:
- Use production Stripe keys (start with `sk_live_` and `pk_live_`)
- Set production webhook secret
- Update `NEXT_PUBLIC_APP_URL` to your domain

### 2. Enable Stripe Live Mode

1. Activate your Stripe account (complete business verification)
2. Switch to Live mode in Stripe Dashboard
3. Recreate products/prices in Live mode
4. Update Price IDs in production environment

### 3. Configure Webhook Endpoint

1. Add production webhook endpoint in Stripe Dashboard
2. Use production webhook secret
3. Test webhook delivery

### 4. Database Migration

```bash
npx prisma db push
```

## Troubleshooting

### Webhooks Not Working

1. Check webhook secret is correct
2. Ensure webhook endpoint is publicly accessible
3. Check webhook logs in Stripe Dashboard
4. Verify events are selected in webhook settings

### Checkout Session Fails

1. Verify Stripe keys are correct
2. Check Price IDs match your Stripe products
3. Ensure customer email is valid
4. Check browser console for errors

### Subscription Not Syncing

1. Verify webhook is receiving events
2. Check server logs for webhook errors
3. Ensure database is accessible
4. Verify Prisma schema is up to date

### Customer Portal Not Opening

1. Enable Customer Portal in Stripe Settings
2. Verify user has `stripeCustomerId`
3. Check API route is working (`/api/stripe/portal`)
4. Ensure return URL is correct

## Support

For issues specific to this boilerplate:
- Check the code comments in `src/lib/stripe.ts`
- Review webhook handler in `src/app/api/stripe/webhook/route.ts`

For Stripe-specific issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

## Security Best Practices

1. **Never commit API keys** - Use environment variables
2. **Verify webhook signatures** - Already implemented
3. **Use HTTPS in production** - Required by Stripe
4. **Keep dependencies updated** - Run `npm audit` regularly
5. **Monitor webhook delivery** - Check Stripe Dashboard regularly

## Next Steps

1. Customize pricing plans for your needs
2. Set up production Stripe account
3. Configure webhook endpoint for production
4. Test entire flow end-to-end
5. Enable subscription enforcement if needed
6. Monitor usage and subscription metrics

---

Built with ❤️ using Next.js, Stripe, and Prisma

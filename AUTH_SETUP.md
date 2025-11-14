# Authentication Setup Guide

This boilerplate includes a complete authentication system with NextAuth, Google OAuth, email verification, password reset, and onboarding flow.

## Features

- ✅ Email/Password authentication
- ✅ Google OAuth integration
- ✅ Email verification
- ✅ Password reset functionality
- ✅ Protected routes with middleware
- ✅ Onboarding flow for new users
- ✅ Session management with NextAuth
- ✅ MongoDB integration with Prisma
- ✅ Beautiful, responsive UI components

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

#### Required Environment Variables:

- **DATABASE_URL**: Your MongoDB connection string
- **NEXTAUTH_SECRET**: Generate with `openssl rand -base64 32`
- **NEXTAUTH_URL**: Your application URL (e.g., `http://localhost:3000`)
- **GOOGLE_CLIENT_ID**: From Google Cloud Console
- **GOOGLE_CLIENT_SECRET**: From Google Cloud Console
- **RESEND_API_KEY**: From Resend dashboard
- **EMAIL_FROM**: Your verified sending email (e.g., `noreply@yourdomain.com`)
- **EMAIL_FROM_NAME**: Display name for emails
- **NEXT_PUBLIC_APP_URL**: Public URL for your app

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth client ID
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
7. Copy Client ID and Client Secret to `.env`

### 3. Resend Email Setup

1. Go to [Resend](https://resend.com/)
2. Sign up and verify your domain
3. Create an API key
4. Add the API key to `.env`
5. Verify your sending email address

### 4. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (for development)
npx prisma db push

# Or run migrations (for production)
npx prisma migrate deploy
```

### 5. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see your application.

## Authentication Flow

### Registration Flow

1. User visits `/register`
2. User fills in name, email, and password OR clicks "Sign up with Google"
3. For email/password:
   - Account is created with unverified status
   - Verification email is sent
   - User is redirected to `/verify-email`
   - User clicks link in email to verify
   - After verification, user can log in
4. For Google OAuth:
   - Account is automatically created and verified
   - User is redirected to onboarding

### Login Flow

1. User visits `/login`
2. User enters credentials OR clicks "Login with Google"
3. For email/password:
   - System checks if email is verified
   - If not verified, shows error
   - If verified, creates session and redirects to onboarding
4. For Google OAuth:
   - Auto-verifies email if not already verified
   - Creates session and redirects to onboarding

### Onboarding Flow

1. After successful login, user is redirected to `/dashboard/onboarding`
2. User completes profile setup
3. System updates `onboarded` status to `true`
4. User is redirected to `/dashboard`
5. User cannot access dashboard pages until onboarding is complete

### Password Reset Flow

1. User clicks "Forgot password" on login page
2. User enters email address
3. System sends password reset email
4. User clicks link in email
5. User enters new password
6. Password is updated, user can log in

## Protected Routes

The middleware (`src/middleware.ts`) handles:

- **Authentication**: Redirects unauthenticated users to `/login`
- **Onboarding check**: Redirects non-onboarded users to `/dashboard/onboarding`
- **Auth page access**: Redirects authenticated users away from login/register pages
- **Onboarding completion**: Redirects onboarded users away from onboarding page

## API Routes

### Authentication Routes

- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-email` - Verify email with token
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/user/onboarding` - Complete onboarding

### NextAuth Routes

- `GET/POST /api/auth/[...nextauth]` - NextAuth handlers
  - `/api/auth/signin` - Sign in page
  - `/api/auth/signout` - Sign out
  - `/api/auth/session` - Get session
  - `/api/auth/providers` - Get providers
  - `/api/auth/callback/google` - Google OAuth callback

## Pages

### Public Pages

- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/forgot-password` - Forgot password page
- `/reset-password` - Reset password page (with token)
- `/verify-email` - Email verification page

### Protected Pages

- `/dashboard` - Main dashboard (requires onboarding)
- `/dashboard/onboarding` - Onboarding flow (one-time)

## Customization

### Email Templates

Edit email templates in `src/lib/email.ts`:
- `sendVerificationEmail()` - Customize verification email
- `sendPasswordResetEmail()` - Customize reset password email

### Onboarding Page

Customize the onboarding form in `src/app/dashboard/onboarding/page.tsx` to collect any data you need from users.

### Middleware Rules

Modify authentication and onboarding rules in `src/middleware.ts`.

### User Schema

Add custom fields to the User model in `prisma/schema.prisma`:

```prisma
model User {
  // ... existing fields
  customField String?
  anotherField Int?
}
```

Then run:
```bash
npx prisma db push
```

## Security Best Practices

1. **Never commit `.env`** - It contains sensitive credentials
2. **Use strong NEXTAUTH_SECRET** - Generate a cryptographically secure random string
3. **HTTPS in production** - Always use HTTPS for authentication
4. **Verify email domains** - Use Resend to verify your sending domain
5. **Rate limiting** - Consider adding rate limiting to auth endpoints
6. **Password requirements** - Current minimum is 8 characters, adjust as needed

## Troubleshooting

### "Invalid credentials" error
- Check if user email is verified
- Verify password is correct
- Check database connection

### Google OAuth not working
- Verify redirect URIs match exactly
- Check if Google+ API is enabled
- Ensure CLIENT_ID and SECRET are correct

### Emails not sending
- Verify Resend API key is valid
- Check if sending domain is verified
- Look for errors in server logs

### Session not persisting
- Check if NEXTAUTH_SECRET is set
- Verify NEXTAUTH_URL matches your domain
- Clear browser cookies and try again

### Onboarding loop
- Check if onboarding API route is working
- Verify session is being updated after onboarding
- Check middleware logic

## Support

For issues or questions about this authentication system, please check:
- NextAuth documentation: https://next-auth.js.org/
- Prisma documentation: https://www.prisma.io/docs
- Resend documentation: https://resend.com/docs

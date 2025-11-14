# Development Guide

## Quick Start (Without Email Configuration)

You can test the complete authentication system without configuring email services. Here's how:

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Register a New User

1. Go to `http://localhost:3000/register`
2. Fill in the registration form
3. Click "Create account"
4. You'll be redirected to the verification page

### 3. Verify Email (Development Mode)

When you register, check your terminal console. You'll see output like:

```
=================================
📧 VERIFICATION EMAIL (Development Mode)
=================================
To: user@example.com
Verification URL: http://localhost:3000/verify-email?token=abc123...
=================================
```

**Option A: Click the Link**
- Copy the verification URL from the terminal
- Paste it in your browser

**Option B: Use Dev Tools (Easier)**
1. Go to `http://localhost:3000/dev-tools`
2. Enter the email address you registered with
3. Click "Verify Email"
4. Done! ✅

### 4. Login

1. Go to `http://localhost:3000/login`
2. Enter your credentials
3. Complete onboarding
4. Access the dashboard

## Development Tools Page

Visit `/dev-tools` for helpful utilities:
- **Manual Email Verification** - Verify emails without clicking links
- **Setup Checklist** - See what's configured
- **Development Notes** - Quick tips

**Note:** This page is only available in development mode.

## Testing Google OAuth (Optional)

To test Google login:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Secret to `.env`:
   ```
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```
5. Restart the dev server
6. Try "Login with Google" button

## Common Development Scenarios

### Scenario 1: Test Registration Flow
1. Register → Check terminal for verification URL
2. Use `/dev-tools` to verify email
3. Login → Complete onboarding → Dashboard

### Scenario 2: Test Password Reset
1. Go to forgot password page
2. Enter email
3. Check terminal for reset URL
4. Copy URL to browser
5. Set new password

### Scenario 3: Test Onboarding Flow
1. Login with verified account
2. First-time users see onboarding
3. Complete onboarding form
4. Redirected to dashboard
5. Try accessing `/dashboard/onboarding` again → redirects to dashboard

### Scenario 4: Test Protected Routes
1. Logout
2. Try accessing `/dashboard` → redirects to login
3. Login
4. Middleware automatically handles onboarding check

## Development vs Production

### Development Mode
- ✅ Email URLs logged to console
- ✅ `/dev-tools` page available
- ✅ Manual email verification
- ✅ Easier testing workflow

### Production Mode
- 📧 Actual emails sent via Resend
- 🔒 `/dev-tools` returns 403
- 🔒 Dev API endpoints disabled
- ✅ Full security enabled

## Troubleshooting

### "Please verify your email before logging in"
- Use `/dev-tools` to verify the email
- Or copy the verification URL from terminal

### "Invalid credentials"
- Make sure email is verified first
- Check password is correct
- Verify user exists in database

### Google OAuth button doesn't work
- Check if Google credentials are configured
- Verify redirect URIs match exactly
- Make sure you're using `http://localhost:3000` (not `127.0.0.1`)

### Session/Login issues
- Clear browser cookies
- Check `.env` has `NEXTAUTH_SECRET`
- Restart dev server

### Can't access dashboard
- Make sure you completed onboarding
- Check if session is active (use React DevTools)

## Database Access

### View Data in Prisma Studio
```bash
npx prisma studio
```
This opens a GUI to view/edit your database.

### Reset Database
```bash
npx prisma db push --force-reset
```
⚠️ This will delete all data!

## Next Steps

Once you're ready for production:

1. ✅ Configure Resend API key (`.env`)
2. ✅ Set up production environment variables
3. ✅ Configure Google OAuth for production domain
4. ✅ Test email sending
5. ✅ Deploy to production
6. ✅ Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL`

See `AUTH_SETUP.md` for detailed production setup.

## Tips

- Keep terminal visible to see verification URLs
- Use `/dev-tools` for faster testing
- Clear cookies if you encounter session issues
- Check `AUTH_SETUP.md` for full documentation
- The boilerplate is fully customizable - modify as needed!

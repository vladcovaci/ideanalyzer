import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs";
import { trackServerEvent } from "@/lib/analytics/server";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error("Please verify your email before logging in");
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email!,
          name: user.name,
          image: user.image,
          emailVerified: user.emailVerified,
          onboarded: user.onboarded,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For OAuth providers (Google), auto-verify email
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (existingUser && !existingUser.emailVerified) {
          await prisma.user.update({
            where: { email: user.email! },
            data: { emailVerified: new Date() },
          });
        }
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.onboarded = (user as { onboarded?: boolean }).onboarded ?? false;
      }

      // Handle session update (for onboarding completion)
      if (trigger === "update" && session) {
        token.onboarded = session.onboarded;
      }

      // Refresh user data including subscription status on each request
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: {
            onboarded: true,
            stripeSubscriptionId: true,
            stripeCurrentPeriodEnd: true,
          },
        });
        if (dbUser) {
          token.onboarded = dbUser.onboarded;
          token.stripeSubscriptionId = dbUser.stripeSubscriptionId;
          token.stripeCurrentPeriodEnd = dbUser.stripeCurrentPeriodEnd;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as { onboarded?: boolean }).onboarded = (token.onboarded as boolean | undefined) ?? false;
      }
      return session;
    },
  },
  events: {
    async linkAccount({ user }) {
      // When OAuth account is linked, mark email as verified
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
    async signIn({ user, account }) {
      await trackServerEvent({
        event: "user_logged_in",
        distinctId: user.id,
        properties: {
          provider: account?.provider ?? "credentials",
          subscription_tier: "free",
        },
      });
    },
    async createUser({ user }) {
      if ((user as { password?: string | null }).password) {
        return;
      }
      await trackServerEvent({
        event: "user_registered",
        distinctId: user.id,
        properties: {
          method: "oauth",
          user_email: user.email,
          subscription_tier: "free",
          registered_at:
            (user as { createdAt?: Date }).createdAt ?? new Date().toISOString(),
        },
      });
    },
  },
};

import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

const isEnvFlagEnabled = () =>
  process.env.ADMIN_DASHBOARD_ENABLED?.toLowerCase() === "true";

const adminEmailList = () =>
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

export const requireAdminSession = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return null;
  }

  const allowedEmails = adminEmailList();

  if (allowedEmails.length > 0) {
    return allowedEmails.includes(session.user.email.toLowerCase())
      ? session
      : null;
  }

  return isEnvFlagEnabled() ? session : null;
};

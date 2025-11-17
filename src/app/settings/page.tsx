import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SettingsPage } from "@/components/settings/settings-page";

export const metadata = {
  title: "Account Settings | Idea Analyzer",
};

export default async function SettingsRoute() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login?callbackUrl=%2Fsettings");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  if (!user) {
    redirect("/dashboard");
  }

  return <SettingsPage user={user} />;
}

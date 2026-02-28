"use client";

import { apiClient } from "@/lib/api/client";
import { FloatingDock } from "@/components/ui/floating-dock";
import {
  IconHome,
  IconCompass,
  IconLibrary,
  IconLayoutDashboard,
  IconLogin,
  IconLogout,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

type LogoutResponse = {
  ok: boolean;
};

function BuyerNavbar({ isUserLoggedIn }: { isUserLoggedIn: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    try {
      setLoading(true);
      const res = await apiClient.post<LogoutResponse>("/api/auth/logout");

      if (res?.data?.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const links = useMemo(() => {
    const baseLinks = [
      {
        title: "Home",
        icon: (
          <IconHome className="h-full w-full text-neutral-600 dark:text-neutral-300" />
        ),
        href: "/",
      },
      {
        title: "Discover",
        icon: (
          <IconCompass className="h-full w-full text-neutral-600 dark:text-neutral-300" />
        ),
        href: "/discover",
      },
      {
        title: "Library",
        icon: (
          <IconLibrary className="h-full w-full text-neutral-600 dark:text-neutral-300" />
        ),
        href: "/library",
      },
    ];

    if (isUserLoggedIn) {
      baseLinks.push(
        {
          title: "Dashboard",
          icon: (
            <IconLayoutDashboard className="h-full w-full text-neutral-600 dark:text-neutral-300" />
          ),
          href: "/dashboard/products",
        },
        {
          title: "Logout",
          icon: (
            <IconLogout className="h-full w-full text-red-500" />
          ),
          href: "#",
        }
      );
    } else {
      baseLinks.push({
        title: "Login",
        icon: (
          <IconLogin className="h-full w-full text-neutral-600 dark:text-neutral-300" />
        ),
        href: "/login",
      });
    }

    return baseLinks;
  }, [isUserLoggedIn, loading]);

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center">
      <FloatingDock items={links} />
    </div>
  );
}

export default BuyerNavbar;

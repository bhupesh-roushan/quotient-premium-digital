"use client";

import { apiClient } from "@/lib/api/client";
import { FloatingDock, DockItem } from "@/components/ui/floating-dock";
import { LogoutConfirmDialog } from "@/components/ui/logout-confirm-dialog";
import { getMeClient } from "@/lib/auth/getMeClient";
import {
  IconHome,
  IconCompass,
  IconLibrary,
  IconLogin,
  IconLogout,
  IconPackage,
  IconCoin,
  IconChartBar,
  IconUpload,
  IconChevronUp,
} from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, useEffect, useRef } from "react";

type LogoutResponse = {
  ok: boolean;
};

function BuyerNavbar({ isUserLoggedIn }: { isUserLoggedIn: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const me = await getMeClient();
      if (me.ok && me.user) {
        setUser({ name: me.user.name, email: me.user.email });
      }
    };
    if (isUserLoggedIn) {
      fetchUser();
    }
  }, [isUserLoggedIn]);

  // Hide timer function
  const startHideTimer = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      if (!isHovered) {
        setIsVisible(false);
      }
    }, 5000);
  };

  // Initial hide timer
  useEffect(() => {
    const initialTimeout = setTimeout(() => {
      if (!isHovered) {
        setIsVisible(false);
      }
    }, 5000);

    return () => {
      clearTimeout(initialTimeout);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isHovered]);

  async function handleLogout() {
    if (loading) return;

    try {
      setLoading(true);
      const res = await apiClient.post<LogoutResponse>("/api/auth/logout");

      if (res?.data?.ok) {
        setShowLogoutConfirm(false);
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const renderIcon = (
    IconComponent: React.ComponentType<{ className?: string }>,
    active: boolean
  ) => {
    return (
      <div
        className={`flex items-center justify-center rounded-full transition-all duration-200 ${
          active ? "bg-violet-500 p-2" : "p-2 hover:bg-violet-500/20"
        }`}
      >
        <IconComponent
          className={`h-5 w-5 transition-colors ${
            active
              ? "text-white"
              : "text-white hover:text-violet-500"
          }`}
        />
      </div>
    );
  };

  const items: DockItem[] = useMemo(() => {
    const base: DockItem[] = [
      {
        title: "Home",
        icon: renderIcon(IconHome, pathname === "/"),
        href: "/",
      },
      {
        title: "Discover",
        icon: renderIcon(IconCompass, pathname === "/discover"),
        href: "/discover",
      },
      {
        title: "Library",
        icon: renderIcon(IconLibrary, pathname === "/library"),
        href: "/library",
      },
    ];

    // Always show dashboard buttons regardless of login status
    base.push(
      {
        title: "Templates",
        icon: renderIcon(IconPackage, pathname === "/dashboard/products"),
        href: "/dashboard/products",
      },
      {
        title: "Sales",
        icon: renderIcon(IconCoin, pathname === "/dashboard/sales"),
        href: "/dashboard/sales",
      },
      {
        title: "Analytics",
        icon: renderIcon(IconChartBar, pathname === "/creator/analytics"),
        href: "/creator/analytics",
      },
      {
        title: "Bulk Import",
        icon: renderIcon(IconUpload, pathname === "/creator/bulk-import"),
        href: "/creator/bulk-import",
      }
    );

    if (isUserLoggedIn && user) {
      base.push({
        title: loading ? "Logging out..." : "Logout",
        icon: (
          <div className="flex items-center justify-center rounded-full p-2">
            <IconLogout
              className={`h-5 w-5 ${
                loading ? "text-neutral-400" : "text-red-500"
              }`}
            />
          </div>
        ),
        onClick: handleLogoutClick,
      });
    } else if (!isUserLoggedIn) {
      base.push({
        title: "Login",
        icon: renderIcon(IconLogin, pathname === "/login"),
        href: "/login",
      });
    }

    return base;
  }, [pathname, isUserLoggedIn, loading, user]);

  return (
    <>
      {/* Navigation dock - only triggers on hover of this specific area */}
      <div 
        className={`fixed bottom-6 left-0 right-0 z-50 flex justify-center transition-all duration-500 ease-out ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"
        }`}
        onMouseEnter={() => {
          setIsHovered(true);
          setIsVisible(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          startHideTimer();
        }}
      >
        <FloatingDock
          items={items}
          desktopClassName="shadow-2xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm"
          mobileClassName="bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm"
        />
      </div>
      
      {/* Arrow indicator - only triggers on hover of this specific area */}
      <div 
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ease-out ${
          isVisible ? "translate-y-10 opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
        }`}
        onMouseEnter={() => {
          setIsHovered(true);
          setIsVisible(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          startHideTimer();
        }}
      >
        <div className="relative w-14 h-14 rounded-full flex items-center justify-center cursor-pointer group">
          {/* Animated gradient border */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 via-pink-500 to-violet-500 animate-spin-slow p-[2px]">
            <div className="w-full h-full rounded-full bg-black/80 backdrop-blur-sm" />
          </div>
          {/* Inner content */}
          <div className="relative z-10 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <IconChevronUp className="w-6 h-6 text-white/70" />
          </div>
        </div>
      </div>
      
      <LogoutConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        onConfirm={handleLogout}
        onCancel={handleCancelLogout}
        userName={user?.name}
      />
    </>
  );
}

export default BuyerNavbar;

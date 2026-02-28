"use client";

import { apiClient } from "@/lib/api/client";
import { FloatingDock, DockItem } from "@/components/ui/floating-dock";
import { LogoutConfirmDialog } from "@/components/ui/logout-confirm-dialog";
import { getMeClient } from "@/lib/auth/getMeClient";
import {
  BadgeDollarSign,
  BarChart3,
  Compass,
  ChevronUp,
  Home,
  Library,
  LogOut,
  Package,
  Upload,
  User,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, useEffect, useRef } from "react";

type LogoutResponse = {
  ok: boolean;
};

export default function CreatorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
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
    fetchUser();
  }, []);

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

  async function onLogout() {
    if (loading) return;

    try {
      setLoading(true);
      const res = await apiClient.post<LogoutResponse>("/api/auth/logout");

      if (res?.data?.ok) {
        setShowLogoutConfirm(false);
        router.push("/login");
        router.refresh();
      }
    } catch (e) {
      console.error(e);
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
    active: boolean,
    forceColor?: string
  ) => {
    return (
      <div
        className={`flex items-center justify-center rounded-full transition-all duration-200 ${
          active ? "bg-violet-500 p-2" : "p-2 hover:bg-violet-500/20"
        }`}
      >
        <IconComponent
          className={`h-5 w-5 transition-colors ${
            forceColor
              ? forceColor
              : active
              ? "text-white"
              : "text-white hover:text-violet-500"
          }`}
        />
      </div>
    );
  };

  const items: DockItem[] = useMemo(() => {
    // All navigation items - same on all pages
    const allItems: DockItem[] = [
      {
        title: "Home",
        icon: renderIcon(Home, pathname === "/"),
        href: "/",
      },
      {
        title: "Discover",
        icon: renderIcon(Compass, pathname === "/discover"),
        href: "/discover",
      },
      {
        title: "Library",
        icon: renderIcon(Library, pathname === "/library"),
        href: "/library",
      },
      {
        title: "Templates",
        icon: renderIcon(Package, pathname === "/dashboard/products"),
        href: "/dashboard/products",
      },
      {
        title: "Sales",
        icon: renderIcon(BadgeDollarSign, pathname === "/dashboard/sales"),
        href: "/dashboard/sales",
      },
      {
        title: "Analytics",
        icon: renderIcon(BarChart3, pathname === "/creator/analytics"),
        href: "/creator/analytics",
      },
      {
        title: "Bulk Import",
        icon: renderIcon(Upload, pathname === "/creator/bulk-import"),
        href: "/creator/bulk-import",
      },
    ];

    // Add user info and logout if logged in
    if (user) {
      allItems.push(
        {
          title: `${user.name} (${user.email})`,
          icon: renderIcon(User, false, "text-emerald-500"),
          href: "#",
        },
        {
          title: loading ? "Logging out..." : "Logout",
          icon: renderIcon(LogOut, false, "text-red-500"),
          onClick: handleLogoutClick,
        }
      );
    }

    return allItems;
  }, [pathname, loading, user]);

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
            <ChevronUp className="w-6 h-6 text-white/70" />
          </div>
        </div>
      </div>
      
      <LogoutConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        onConfirm={onLogout}
        onCancel={handleCancelLogout}
        userName={user?.name}
      />
    </>
  );
}
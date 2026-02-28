import { ReactNode } from "react";
import BuyerNavbar from "./navbar";
import { getMe } from "@/lib/auth/getMe";
import { BackgroundBeams } from "@/components/ui/background-beams";

export default async function BuyerSell({ children }: { children: ReactNode }) {
  const me = await getMe();

  return (
    <div className="min-h-screen w-full bg-neutral-950 relative overflow-hidden text-white">
      <BuyerNavbar isUserLoggedIn={me?.ok} />

      <div className="relative z-10">
        {children}
      </div>

      <BackgroundBeams />
    </div>
  );
}
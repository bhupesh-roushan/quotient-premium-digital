"use client";
import { apiClient } from "@/lib/api/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type CreateSessionRes = {
  ok: boolean;
  error?: string;
  razorpay?: {
    keyId: string;
    orderId: string;
    amount: number;
    currency: string;
  };
  order?: {
    id: string;
    title: string;
    description: string;
  };
};

type ConfirmRes = { ok: boolean; error?: string };

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.Razorpay) return resolve();

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Razorpay script failed to load')));
      return;
    }

    // Load the script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Razorpay script failed to load'));
    document.body.appendChild(script);
  });
}

function BuyNewButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onBuy() {
    if (loading) return;

    setLoading(true);

    try {
      // Load Razorpay script first
      await loadRazorpayScript();

      const { data: res } = await apiClient.post<CreateSessionRes>(
        "/api/checkout/create-session",
        { productId },
      );

      if (!res.ok || !res.razorpay || !res.order) {
        alert("Failed to start checkout");
        return;
      }

      if (!window.Razorpay) throw new Error("Razorpay not loaded");

      const options: RazorpayOptions = {
        key: res.razorpay.keyId,
        amount: res.razorpay.amount,
        currency: res.razorpay.currency,
        name: "Cloudwatch",
        description: res.order.title,
        order_id: res.razorpay.orderId,
        handler: async (resp) => {
          const confirmResp = await apiClient.post<ConfirmRes>(
            "/api/checkout/confirm",
            {
              orderId: res.order?.id!,
              ...resp,
            },
          );

          if (confirmResp.data.ok) router.push("/library");
          else router.push("/checkout/cancel");
        },

        modal: {
          ondismiss: () => router.push("/checkout/cancel"),
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (e) {
      console.log(e);
      alert("Failed to load payment gateway. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onBuy}
      disabled={loading}
      className="w-full rounded-xl px-4 py-4 cursor-pointer text-sm disabled:opacity-50 font-semibold transition-all duration-200 backdrop-blur-md bg-pink-500/20 border border-pink-500/40 text-pink-200 hover:bg-pink-500/30 hover:border-pink-400/60 shadow-lg shadow-pink-500/20 hover:shadow-pink-500/30"
    >
      {loading ? "Starting payment..." : "Buy Now"}
    </button>
  );
}

export default BuyNewButton;

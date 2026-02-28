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

function waitForRazorpay(timeout = 3000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();

    const t0 = Date.now();

    const t = setInterval(() => {
      if (window.Razorpay) {
        clearInterval(t);
        resolve();
      } else if (Date.now() - t0 > timeout) {
        clearInterval(t);
        reject(new Error("Razorpay not loaded"));
      }
    }, 25);
  });
}

function BuyNewButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onBuy() {
    if (loading) return;

    setLoading(true);

    try {
      const { data: res } = await apiClient.post<CreateSessionRes>(
        "/api/checkout/create-session",
        { productId },
      );

      if (!res.ok || !res.razorpay || !res.order) {
        alert("Failed to start checjout");
        return;
      }

      await waitForRazorpay();
      if (!window.Razorpay) throw new Error("Razorpay not loaded");

      const options: RazorpayOptions = {
        key: res.razorpay.keyId,
        amount: res.razorpay.amount,
        currency: res.razorpay.currency,
        name: "Quotient",
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onBuy}
      disabled={loading}
      className="w-full rounded-full border px-4 py-4 bg-pink-500 cursor-pointer text-sm disabled:opacity-65 font-medium"
    >
      {loading ? "Starting payment..." : "Buy Now"}
    </button>
  );
}

export default BuyNewButton;

export {};

declare global {
  type RazorpaySuccessResponse = {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  };

  type RazorpayOptions = {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    order_id: string;

    handler: (resp: RazorpaySuccessResponse) => void;

    modal?: {
      ondismiss?: () => void;
    };
  };

  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

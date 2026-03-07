import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "CloudWatch",
  
  description: "AI-Powered Digital Creator Marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="h-full top-0 bg-black text-white antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}

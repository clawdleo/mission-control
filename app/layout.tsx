import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mission Control - Leo's Activity Feed",
  description: "Real-time activity tracking dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}

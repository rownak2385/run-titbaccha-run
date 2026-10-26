import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Run Titibaccha, Run! — Chapter 1 Garden Slice",
  description: "An original narrative 2D platforming adventure starring Titibaccha.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-screen w-screen overflow-hidden bg-stone-950 text-stone-100 antialiased">
        {children}
      </body>
    </html>
  );
}

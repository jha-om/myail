import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import KBar from "@/components/kbar";
import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/react";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "myail",
  description: "ai powered mail",
  icons: [{ rel: "icon", url: "/favicon.svg" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
        <body className="antialiased overflow-hidden">
          <TRPCReactProvider>
            <KBar>
              {children}
            </KBar>
          </TRPCReactProvider>
          <Toaster position="bottom-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}

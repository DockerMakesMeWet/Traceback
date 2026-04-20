import type { Metadata } from "next";
import "./globals.css";
import { ApolloWrapper } from "./ApolloWrapper";

export const metadata: Metadata = {
  title: "Traceback",
  description: "Network-wide logging & monitoring for Minecraft",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen font-mono">
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  );
}

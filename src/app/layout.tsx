import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DayZ Economy Manager",
  description: "All-in-one Economy Management Tool for DayZ Standalone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

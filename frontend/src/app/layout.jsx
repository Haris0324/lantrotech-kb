// removed type import
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Lantrotech KB",
  description: "Internal Knowledge Base Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-900 text-slate-50 antialiased min-h-screen`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

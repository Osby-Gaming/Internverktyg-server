import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Internverktyget Osby Gaming",
  description: "Cool stuff",
};

import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import AuthRouter from "@/lib/components/AuthRouter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons";
import { Roboto_Mono } from 'next/font/google';
import Link from "next/link";
config.autoAddCss = false

const MainFont = Roboto_Mono({
  style: "normal",
  subsets: ['latin']
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${MainFont.className} antialiased`}
      >
        <Link href="/" className="absolute top-10 left-10 text-[#00A576] bg-gray-700 p-1 rounded-full">
          <FontAwesomeIcon icon={faHouse} size="2x" />
        </Link>
        <div className="min-h-screen w-full flex justify-center items-center">
          <AuthRouter>
            {children}
          </AuthRouter>
        </div>
      </body>
    </html>
  );
}

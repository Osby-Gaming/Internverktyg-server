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
import Link from "next/link";
config.autoAddCss = false

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href='https://fonts.googleapis.com/css?family=Roboto Mono' rel='stylesheet' />
      </head>
      <body
        className={`antialiased`}
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

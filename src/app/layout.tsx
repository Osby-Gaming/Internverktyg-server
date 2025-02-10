import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Internverktyget Osby Gaming",
  description: "Cool stuff",
};

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
        <div className="min-h-screen w-full flex justify-center items-center">
          {children}
        </div>
      </body>
    </html>
  );
}

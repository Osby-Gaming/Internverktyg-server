'use client'

import { useEffect } from "react";
import { getLoggedInAccount } from "../appwrite_client";
import { useRouter, usePathname } from "next/navigation";

const guestPaths: string[] = ['/login', '/seatmap', '/logout'];

export default function AuthRouter({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    const router = useRouter();
    const pathname = usePathname();

    // Not very complex as this system won't allow subpaths that aren't for guests
    if (guestPaths.find(path => pathname.startsWith(path))) {
      return children;
    }

    useEffect(() => {
      (async () => {
        if ((await getLoggedInAccount()).data === null) {
          router.push('/login');
        }
      })()
    })

    return children;
  }
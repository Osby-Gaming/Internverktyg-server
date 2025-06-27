'use client'

import { useEffect } from "react";
import { getLoggedInAccount } from "../appwrite_client";
import { useRouter, usePathname } from "next/navigation";

const guestPaths: string[] = ['/login', '/seatmap/public', '/logout'];

export default function AuthRouter({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    const router = useRouter();
    const pathname = usePathname();

    // Not very complex as this system won't allow subpaths that aren't for guests

    useEffect(() => {
      (async () => {
        if ((await getLoggedInAccount()).data === null && !guestPaths.find(path => pathname.startsWith(path))) {
          router.push('/login');
        }
        if (guestPaths.find(path => pathname.startsWith(path))) {
          const homebutton = document.getElementById("homebutton");
          
          if (homebutton) {
            homebutton.style.display = "none";
          }
        }
      })()
    }, [children]);

    return children;
  }
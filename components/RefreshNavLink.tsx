"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

/** Nav-Link, der nach der Navigation router.refresh() ausführt, damit die Zielseite mit aktuellen Daten lädt. */
export function RefreshNavLink({ href, children, className, onClick }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <Link
      href={href}
      className={className}
      onClick={(e) => {
        onClick?.();
        e.preventDefault();
        const target = href.replace(/\?.*$/, "");
        if (pathname === target) {
          router.refresh();
        } else {
          router.push(href);
          setTimeout(() => router.refresh(), 50);
        }
      }}
    >
      {children}
    </Link>
  );
}

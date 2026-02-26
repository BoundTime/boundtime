"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function ScrollToPostForm() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("scroll") !== "post") return;
    const el = document.getElementById("post-form");
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [searchParams]);

  return null;
}

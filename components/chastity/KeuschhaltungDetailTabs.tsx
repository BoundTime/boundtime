"use client";

import Link from "next/link";
import { useState } from "react";

type Tab = "status" | "chat";

export function KeuschhaltungDetailTabs({
  partnerId,
  children,
}: {
  partnerId: string;
  children: React.ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("status");

  return (
    <div>
      <div className="flex gap-2 border-b border-gray-700">
        <button
          type="button"
          onClick={() => setTab("status")}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            tab === "status"
              ? "border-accent text-accent"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          Status
        </button>
        <button
          type="button"
          onClick={() => setTab("chat")}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            tab === "chat"
              ? "border-accent text-accent"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          Chat
        </button>
      </div>
      {tab === "status" && <div className="pt-4">{children}</div>}
      {tab === "chat" && (
        <div className="pt-6">
          <Link
            href={`/dashboard/nachrichten?with=${partnerId}`}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            Nachricht an Partner schreiben
          </Link>
          <p className="mt-4 text-sm text-gray-500">
            Öffne die Nachrichten, um mit deinem Partner bzw. Keyholder zu chatten.
          </p>
        </div>
      )}
    </div>
  );
}

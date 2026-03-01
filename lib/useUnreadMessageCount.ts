"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useUnreadMessageCount(userId?: string | undefined) {
  const [uid, setUid] = useState<string | undefined>(userId ?? undefined);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (userId != null) {
      setUid(userId);
      return;
    }
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUid(session?.user?.id ?? undefined);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUid(session?.user?.id ?? undefined);
    });
    return () => subscription.unsubscribe();
  }, [userId]);

  useEffect(() => {
    if (!uid) {
      setCount(0);
      return;
    }
    const supabase = createClient();

    async function load() {
      const { data, error } = await supabase.rpc("get_unread_message_count");
      if (!error && data != null) setCount(Number(data));
      else if (!error) setCount(0);
    }

    load();

    const channel = supabase
      .channel("unread-messages")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => load())
      .subscribe();

    const onMessagesRead = () => load();
    if (typeof window !== "undefined") {
      window.addEventListener("messages-read", onMessagesRead);
    }

    return () => {
      supabase.removeChannel(channel);
      if (typeof window !== "undefined") {
        window.removeEventListener("messages-read", onMessagesRead);
      }
    };
  }, [uid]);

  return count;
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export type Msg = { kind: "ok" | "error"; text: string } | null;

/** Lance une action serveur, affiche le résultat, puis recharge les données. */
export function useRun() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<Msg>(null);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, okText: string, after?: () => void) {
    setMsg(null);
    start(async () => {
      const r = await fn();
      if (!r.ok) {
        setMsg({ kind: "error", text: r.error ?? "Erreur inconnue." });
        return;
      }
      setMsg({ kind: "ok", text: okText });
      after?.();
      router.refresh();
    });
  }

  return { pending, msg, setMsg, run };
}

"use client";

import { setRequestStatus } from "./actions";
import { useRun } from "../../components/useRun";
import { useL } from "../../components/LangProvider";
import { REQUEST_STATUS_LABEL, type RequestStatus } from "../../lib/requestStatuses";

const OK: Record<RequestStatus, string> = {
  new: "Marquée comme nouvelle.",
  read: "Marquée comme vue.",
  converted: "Marquée comme convertie.",
  declined: "Marquée comme refusée.",
};

export default function RequestActions({ id, status, email }: { id: number; status: string | null; email: string | null }) {
  const { pending, msg, run } = useRun();
  const { t } = useL();
  const subject = encodeURIComponent("Re: your request — Kizuna Proxy");
  const choices: RequestStatus[] = ["read", "converted", "declined", "new"];

  return (
    <div className="av2-req-actions">
      {email ? (
        <a
          className="av2-btn sm"
          href={`mailto:${email}?subject=${subject}`}
          onClick={() => {
            if (status === "new") run(() => setRequestStatus(id, "read"), OK.read);
          }}
        >
          {t("Répondre par email")}
        </a>
      ) : null}
      {choices
        .filter((s) => s !== status)
        .map((s) => (
          <button key={s} className="av2-btn ghost sm" disabled={pending} onClick={() => run(() => setRequestStatus(id, s), OK[s])}>
            {t(REQUEST_STATUS_LABEL[s])}
          </button>
        ))}
      {msg?.kind === "error" ? <small className="av2-error">{msg.text}</small> : null}
    </div>
  );
}

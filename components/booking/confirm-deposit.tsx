"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export function ConfirmDeposit() {
  const params = useSearchParams();
  const [note, setNote] = useState("");

  useEffect(() => {
    const sessionId = params.get("session_id");
    const fromQuery = params.get("appointment_id");
    const stored =
      typeof window !== "undefined"
        ? sessionStorage.getItem("pendingAppointmentId")
        : null;
    const appointmentId = fromQuery || stored;
    if (!sessionId || !appointmentId) return;
    const idNum = Number(appointmentId);
    if (!Number.isFinite(idNum) || idNum <= 0) return;

    fetch("/api/appointments/confirm-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        appointment_id: idNum,
        session_id: sessionId,
      }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          setNote("Your deposit has been confirmed.");
          sessionStorage.removeItem("pendingAppointmentId");
        } else {
          setNote(
            (data.message as string) ||
              "Your appointment is reserved. Deposit confirmation may take a moment.",
          );
        }
      })
      .catch(() => {
        setNote("Your appointment is reserved. Deposit confirmation may take a moment.");
      });
  }, [params]);

  if (!note) return null;
  return <p className="mt-4 text-sm text-gold">{note}</p>;
}

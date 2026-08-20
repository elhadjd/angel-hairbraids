"use server";

import { redirect } from "next/navigation";
import { clearAdminCookie, passwordsMatch, setAdminCookie } from "@/lib/auth";

export async function loginAdmin(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!passwordsMatch(password)) {
    redirect("/admin/login?error=1");
  }
  await setAdminCookie();
  redirect("/admin");
}

export async function logoutAdmin() {
  await clearAdminCookie();
  redirect("/admin/login");
}

import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { Container, SectionHeading } from "@/components/ui/button";
import { AccountPortal } from "@/components/account/portal";

export const metadata: Metadata = {
  title: "My Visits",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <SiteShell>
      <section className="bg-ivory pt-32 pb-24">
        <Container>
          <SectionHeading
            kicker="Client"
            title="My visits"
            copy="Review upcoming appointments, history, and the styles you love."
          />
          <div className="mt-12">
            <AccountPortal />
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}

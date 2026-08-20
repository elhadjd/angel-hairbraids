import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteShell } from "@/components/layout/site-shell";
import { Container } from "@/components/ui/button";
import { BookingWizard } from "@/components/booking/wizard";

export const metadata: Metadata = {
  title: "Book Your Appointment",
  description:
    "Reserve your African hair braiding appointment at Angel African Hair Braiding in Columbus, Ohio. Choose a service, stylist, date, and time.",
};

export default function BookPage() {
  return (
    <SiteShell>
      <section className="bg-ivory pt-32 pb-24">
        <Container>
          <Suspense fallback={<div className="skeleton h-[60vh] w-full" />}>
            <BookingWizard />
          </Suspense>
        </Container>
      </section>
    </SiteShell>
  );
}

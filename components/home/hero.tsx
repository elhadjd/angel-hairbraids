import { Button } from "@/components/ui/button";
import { Media } from "@/components/ui/media";
import { site } from "@/lib/site";
import type { SiteMediaAsset } from "@/lib/types";

export function Hero({ media }: { media?: SiteMediaAsset | null }) {
  const image = media?.mediaUrl || "/images/hero-portrait.jpg";
  const caption = media?.title || "Knotless & box braids";
  const copy =
    media?.description ||
    "A private atelier specializing in knotless braids, box braids, cornrows, and ceremonial African styles — crafted with patience, precision, and reverence for the hair.";
  const ctaHref = media?.buttonUrl || "/book";
  const ctaLabel = media?.buttonLabel || "Book Your Appointment";

  return (
    <section className="relative min-h-[100svh] bg-espresso text-ivory">
      <div className="grid min-h-[100svh] lg:grid-cols-12">
        <div className="relative z-10 flex flex-col justify-end px-4 pb-10 pt-28 sm:px-8 sm:pb-20 lg:col-span-5 lg:justify-center lg:px-12 lg:pb-0 lg:pt-24">
          <p className="kicker animate-fade-up">
            {site.address.city}, {site.address.state} · Est. {site.founded}
          </p>
          <h1 className="animate-fade-up delay-1 mt-5 font-display text-[2.45rem] leading-[0.95] sm:text-6xl lg:text-[4.4rem] xl:text-[5.1rem]">
            Where African
            <span className="italic text-gold"> Beauty </span>
            Meets Modern Style.
          </h1>
          <p className="animate-fade-up delay-2 mt-5 max-w-md text-sm leading-relaxed text-ivory/70 sm:mt-6 sm:text-lg">
            {copy}
          </p>
          <div className="animate-fade-up delay-3 mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row">
            <Button href={ctaHref} className="w-full sm:w-auto">
              {ctaLabel}
            </Button>
            <Button href="/gallery" variant="ghost" className="w-full sm:w-auto">
              Explore Our Styles
            </Button>
          </div>
        </div>

        <div className="relative min-h-[48vh] sm:min-h-[62vh] lg:col-span-7 lg:min-h-[100svh]">
          <Media
            src={image}
            alt={caption || "Editorial portrait from Angel African Hair Braiding"}
            type={media?.type}
            preload
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="animate-fade-in object-cover object-[center_20%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/20 to-transparent lg:bg-gradient-to-r lg:from-espresso lg:via-espresso/10 lg:to-transparent" />
          <div className="absolute bottom-8 right-8 hidden max-w-[11rem] text-right text-[10px] leading-relaxed tracking-[0.22em] uppercase text-ivory/70 lg:block">
            {caption}
            <br />
            Columbus, Ohio
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 lg:flex">
        <a
          href="#atelier"
          className="flex flex-col items-center gap-3 text-[9px] tracking-[0.4em] uppercase text-gold"
        >
          Scroll
          <span className="block h-10 w-px bg-gold/60" />
        </a>
      </div>
    </section>
  );
}

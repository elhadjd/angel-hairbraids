import { site } from "@/lib/site";
import { Button, Container } from "@/components/ui/button";
import { Media } from "@/components/ui/media";
import { Reveal } from "@/components/ui/reveal";

const fallback = [
  "/images/gallery-01.jpg",
  "/images/gallery-02.jpg",
  "/images/gallery-03.jpg",
  "/images/gallery-04.jpg",
  "/images/gallery-06.jpg",
  "/images/gallery-08.jpg",
];

export function Instagram({ images = [] }: { images?: string[] }) {
  const shots = (images.length ? images : fallback).slice(0, 6);

  return (
    <section className="bg-paper py-24">
      <Container>
        <Reveal>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="kicker break-all">{site.instagramHandle}</p>
              <h2 className="mt-3 font-display text-[2.1rem] leading-tight sm:text-5xl">
                Follow Our Latest Styles
              </h2>
            </div>
            <Button href={site.instagram} variant="ink" className="w-full sm:w-auto">
              Follow Us on Instagram
            </Button>
          </div>
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
          {shots.map((src, i) => (
            <a
              key={`${src}-${i}`}
              href={site.instagram}
              target="_blank"
              rel="noreferrer"
              className="img-zoom relative aspect-square overflow-hidden"
            >
              <Media
                src={src}
                alt={`Latest style ${i + 1} from Angel African Hair Braiding`}
                sizes="(max-width: 768px) 50vw, 16vw"
              />
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}

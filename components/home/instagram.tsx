import Image from "next/image";
import { site } from "@/lib/site";
import { Button, Container } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { warmBlur } from "@/lib/blur";

const shots = [
  "/images/gallery-01.jpg",
  "/images/gallery-02.jpg",
  "/images/gallery-03.jpg",
  "/images/gallery-04.jpg",
  "/images/gallery-06.jpg",
  "/images/gallery-08.jpg",
];

export function Instagram() {
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
              key={src}
              href={site.instagram}
              target="_blank"
              rel="noreferrer"
              className="img-zoom relative aspect-square overflow-hidden"
            >
              <Image
                src={src}
                alt={`Latest style ${i + 1} from Angel African Hair Braiding`}
                fill
                placeholder="blur"
                blurDataURL={warmBlur}
                sizes="(max-width: 768px) 50vw, 16vw"
                className="object-cover"
              />
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}

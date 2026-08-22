import Image from "next/image";
import { cn } from "@/lib/format";
import { warmBlur } from "@/lib/blur";

function isRemote(src: string) {
  return src.startsWith("http://") || src.startsWith("https://");
}

type Props = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  fill?: boolean;
  preload?: boolean;
  type?: string;
};

export function Media({
  src,
  alt,
  className,
  sizes,
  fill = true,
  preload,
  type = "image",
}: Props) {
  if (!src) {
    return <div className={cn("bg-paper", fill && "absolute inset-0", className)} />;
  }

  if (type.includes("video") || /\.(mp4|webm|ogg)(\?|$)/i.test(src)) {
    return (
      <video
        src={src}
        className={cn(fill && "absolute inset-0 h-full w-full", "object-cover", className)}
        autoPlay
        muted
        loop
        playsInline
        poster={undefined}
      />
    );
  }

  if (isRemote(src)) {
    return (
      // Remote SISGESC storage URLs are already absolute.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={cn(fill && "absolute inset-0 h-full w-full", "object-cover", className)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      preload={preload}
      placeholder="blur"
      blurDataURL={warmBlur}
      sizes={sizes}
      className={cn("object-cover", className)}
    />
  );
}

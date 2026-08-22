import Image from "next/image";
import { cn } from "@/lib/format";
import { warmBlur } from "@/lib/blur";

function normalizeSrc(src: string) {
  let value = src.trim();
  if (!value || value === "null" || value === "undefined") return "";
  if (value.startsWith("//")) value = `http:${value}`;
  if (/^https?:\/[^/]/i.test(value)) {
    value = value.replace(/^http:\//i, "http://").replace(/^https:\//i, "https://");
  }
  return value;
}

function isLocalPublic(src: string) {
  return src.startsWith("/images/") || src.startsWith("/icon") || src.startsWith("/pattern");
}

function isRemote(src: string) {
  return /^https?:\/\//i.test(src) || src.startsWith("//");
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
  const value = normalizeSrc(src);

  if (!value) {
    return <div className={cn("bg-paper", fill && "absolute inset-0", className)} />;
  }

  if (type.includes("video") || /\.(mp4|webm|ogg)(\?|$)/i.test(value)) {
    return (
      <video
        src={value}
        className={cn(fill && "absolute inset-0 h-full w-full", "object-cover", className)}
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }

  if (!isLocalPublic(value) || isRemote(value)) {
    return (
      // SISGESC storage URLs are remote or not in /public.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={value}
        alt={alt}
        className={cn(fill && "absolute inset-0 h-full w-full", "object-cover", className)}
      />
    );
  }

  return (
    <Image
      src={value}
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

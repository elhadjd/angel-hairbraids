import Link from "next/link";
import { cn } from "@/lib/format";

type Props = {
  href?: string;
  children: React.ReactNode;
  variant?: "gold" | "ghost" | "ivory" | "ink";
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
};

export function Button({
  href,
  children,
  variant = "gold",
  className,
  type = "button",
  onClick,
  disabled,
}: Props) {
  const styles = cn(
    "inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[11px] tracking-[0.28em] uppercase transition-all duration-500 disabled:opacity-40",
    variant === "gold" &&
      "bg-gold text-ink hover:bg-gold-bright hover:tracking-[0.34em]",
    variant === "ghost" &&
      "border border-gold/50 text-gold hover:bg-gold hover:text-ink",
    variant === "ivory" && "bg-ivory text-ink hover:bg-white",
    variant === "ink" && "bg-ink text-ivory hover:bg-espresso",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={styles}>
      {children}
    </button>
  );
}

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12", className)}>
      {children}
    </div>
  );
}

export function SectionHeading({
  kicker,
  title,
  copy,
  light = false,
}: {
  kicker: string;
  title: string;
  copy?: string;
  light?: boolean;
}) {
  return (
    <div className="max-w-2xl">
      <p className="kicker">{kicker}</p>
      <h2
        className={cn(
          "mt-4 font-display text-4xl leading-[1.1] sm:text-5xl lg:text-6xl",
          light ? "text-ivory" : "text-ink",
        )}
      >
        {title}
      </h2>
      {copy ? (
        <p
          className={cn(
            "mt-5 max-w-xl text-base leading-relaxed sm:text-lg",
            light ? "text-ivory/70" : "text-muted",
          )}
        >
          {copy}
        </p>
      ) : null}
    </div>
  );
}

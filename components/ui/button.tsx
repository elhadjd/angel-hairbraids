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
    "inline-flex min-h-12 items-center justify-center gap-2 px-5 py-3.5 text-center text-[11px] tracking-[0.18em] uppercase transition-colors duration-300 disabled:opacity-40 sm:px-7 sm:tracking-[0.24em]",
    variant === "gold" && "bg-gold text-ink hover:bg-gold-bright",
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
    <div className={cn("mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-12", className)}>
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
          "mt-4 font-display text-[2.1rem] leading-[1.1] sm:text-5xl lg:text-6xl",
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

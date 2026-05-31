import Image from "next/image";
import { cn } from "@/common/utils/cn";
import { GENEX_BRAND } from "@/common/brand/constants";

type GenexLogoProps = {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "onPrimary";
};

const sizeMap = {
  sm: { mark: 28, word: "text-base" },
  md: { mark: 36, word: "text-xl" },
  lg: { mark: 44, word: "text-2xl" },
} as const;

export function GenexLogo({
  className,
  showWordmark = true,
  size = "md",
  variant = "default",
}: GenexLogoProps) {
  const dimensions = sizeMap[size];
  const onPrimary = variant === "onPrimary";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <GenexMark className="shrink-0" size={dimensions.mark} variant={variant} />
      {showWordmark ? (
        <div className="min-w-0 leading-tight">
          <p
            className={cn(
              "font-semibold tracking-[0.18em]",
              dimensions.word,
              onPrimary ? "text-primary-foreground" : "text-foreground",
            )}
          >
            {GENEX_BRAND.name}
          </p>
          {size !== "sm" ? (
            <p
              className={cn(
                "text-xs",
                onPrimary ? "text-primary-foreground/75" : "text-muted-foreground",
              )}
            >
              {GENEX_BRAND.tagline}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function GenexMark({
  className,
  size = 36,
  variant = "default",
}: {
  className?: string;
  size?: number;
  variant?: "default" | "onPrimary";
}) {
  return (
    <svg
      aria-hidden
      className={cn("shrink-0", className)}
      height={size}
      viewBox="0 0 64 64"
      width={size}
    >
      <defs>
        <linearGradient id="genex-gradient" x1="8" x2="56" y1="8" y2="56">
          <stop offset="0%" stopColor={variant === "onPrimary" ? "#ecfdf5" : "#14b8a6"} />
          <stop offset="100%" stopColor={variant === "onPrimary" ? "#99f6e4" : "#0f766e"} />
        </linearGradient>
      </defs>
      <rect fill="url(#genex-gradient)" height="64" rx="16" width="64" />
      <path
        d="M38 18H24c-4.4 0-8 3.6-8 8v12c0 4.4 3.6 8 8 8h8"
        fill="none"
        stroke={variant === "onPrimary" ? "#042f2e" : "#ffffff"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5"
      />
      <path
        d="M24 32h12"
        stroke={variant === "onPrimary" ? "#042f2e" : "#ffffff"}
        strokeLinecap="round"
        strokeWidth="5"
      />
      <circle cx="44" cy="20" fill={variant === "onPrimary" ? "#042f2e" : "#ffffff"} r="3" />
      <circle cx="48" cy="44" fill={variant === "onPrimary" ? "#042f2e" : "#ffffff"} r="3" opacity="0.85" />
    </svg>
  );
}

export function GenexLogoImage({
  className,
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      alt={`${GENEX_BRAND.name} logo`}
      className={cn("rounded-xl", className)}
      height={size}
      src="/brand/genex-mark.png"
      width={size}
    />
  );
}

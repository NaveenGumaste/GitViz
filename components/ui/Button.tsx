"use client";

import Link from "next/link";
import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "ghost" | "outline" | "nav";
type ButtonSize = "sm" | "md" | "lg";

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  className?: string;
  children: ReactNode;
}

interface ButtonAsButtonProps
  extends CommonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps | "href"> {
  href?: undefined;
}

interface ButtonAsLinkProps extends CommonProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps | "type"> {
  href: string;
  target?: string;
  rel?: string;
}

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-accent text-paper shadow-[0_10px_24px_rgba(255,77,0,0.22)] hover:bg-accent/90 hover:shadow-[0_14px_32px_rgba(255,77,0,0.3)]",
  ghost: "bg-transparent text-ink hover:bg-accent-muted dark:text-paper dark:hover:bg-accent-muted",
  outline: "border border-border bg-transparent text-ink hover:border-accent hover:text-accent dark:border-border-dark dark:text-paper",
  nav: "bg-surface-light/90 text-ink shadow-sm hover:-translate-y-0.5 hover:shadow-md dark:bg-surface/90 dark:text-paper",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

function baseClasses(variant: ButtonVariant, size: ButtonSize): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60",
    variantClasses[variant],
    sizeClasses[size],
  );
}

function Content({ loading, iconLeft, iconRight, children }: Pick<CommonProps, "loading" | "iconLeft" | "iconRight" | "children">): ReactNode {
  return (
    <>
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : iconLeft}
      <span>{children}</span>
      {!loading ? iconRight : null}
    </>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  if ("href" in props && props.href) {
    const {
      href,
      target,
      rel,
      variant = "primary",
      size = "md",
      loading = false,
      iconLeft,
      iconRight,
      className,
      children,
      ...anchorProps
    } = props as ButtonAsLinkProps;
    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        className={cn(baseClasses(variant, size), className)}
        aria-busy={loading || undefined}
        {...anchorProps}
      >
        <Content loading={loading} iconLeft={iconLeft} iconRight={iconRight}>
          {children}
        </Content>
      </Link>
    );
  }

  const {
    variant = "primary",
    size = "md",
    loading = false,
    iconLeft,
    iconRight,
    className,
    children,
    ...buttonProps
  } = props as ButtonAsButtonProps;

  return (
    <button
      ref={ref}
      type={(buttonProps as ButtonHTMLAttributes<HTMLButtonElement>).type ?? "button"}
      className={cn(baseClasses(variant, size), className)}
      aria-busy={loading || undefined}
      disabled={loading || (buttonProps as ButtonHTMLAttributes<HTMLButtonElement>).disabled}
      {...buttonProps}
    >
      <Content loading={loading} iconLeft={iconLeft} iconRight={iconRight}>
        {children}
      </Content>
    </button>
  );
});

Button.displayName = "Button";

"use client";

import { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-bold uppercase tracking-widest transition-colors";
  
  const variants = {
    primary: "bg-wol-graphite text-wol-white hover:bg-wol-black",
    secondary: "border border-wol-graphite text-wol-graphite bg-transparent hover:bg-wol-graphite hover:text-wol-white",
    ghost: "text-wol-graphite hover:bg-wol-graphite/5 bg-transparent",
  };
  
  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  const classes = cn(baseStyles, variants[variant], sizes[size], className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

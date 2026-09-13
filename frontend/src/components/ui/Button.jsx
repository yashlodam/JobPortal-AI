/**
 * src/components/ui/Button.jsx
 * Enterprise SaaS Button primitive.
 * Supports variants, sizes, loading state, leading/trailing icons, and keyboard accessibility.
 */
import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export const Button = forwardRef(function Button(
  {
    children,
    type = "button",
    variant = "primary",
    size = "md",
    isLoading = false,
    loadingText,
    disabled = false,
    icon: Icon,
    iconRight: IconRight,
    className = "",
    onClick,
    ...props
  },
  ref
) {
  const baseStyles =
    "relative inline-flex items-center justify-center font-medium font-inter rounded-xl transition-all duration-200 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]";

  const variants = {
    primary:
      "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-sm hover:shadow-indigo-500/20 border border-indigo-500/30",
    secondary:
      "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] dark:text-slate-200 dark:border-white/10",
    outline:
      "bg-transparent border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 dark:border-white/20 dark:hover:border-white/40 dark:text-slate-300 dark:hover:text-white",
    ghost:
      "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 dark:hover:bg-white/[0.08] dark:text-slate-400 dark:hover:text-white",
    danger:
      "bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-sm border border-rose-500/30",
    dangerOutline:
      "bg-transparent border border-rose-500/40 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10",
    success:
      "bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-sm border border-emerald-500/30",
    gradient:
      "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-500/20 border border-indigo-400/20",
  };

  const sizes = {
    xs: "px-2.5 py-1 text-xs gap-1.5 rounded-lg",
    sm: "px-3.5 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5",
    xl: "px-6 py-3 text-lg gap-3 rounded-2xl",
    icon: "p-2 rounded-xl",
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="h-4 w-4 shrink-0" />}
          {children}
          {IconRight && <IconRight className="h-4 w-4 shrink-0" />}
        </>
      )}
    </button>
  );
});

export default Button;
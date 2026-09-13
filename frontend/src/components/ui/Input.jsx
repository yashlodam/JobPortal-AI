/**
 * src/components/ui/Input.jsx
 * Accessible form input with labels, hint descriptions, error messaging, and icon adornments.
 */
import React, { forwardRef } from "react";

export const Input = forwardRef(function Input(
  {
    label,
    description,
    error,
    id,
    name,
    type = "text",
    placeholder,
    value,
    defaultValue,
    onChange,
    disabled = false,
    required = false,
    icon: Icon,
    iconRight: IconRight,
    onRightIconClick,
    className = "",
    containerClassName = "",
    ...props
  },
  ref
) {
  const inputId = id || name || `input-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`flex flex-col gap-1.5 w-full font-inter ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </span>
        </label>
      )}

      {description && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}

      <div className="relative flex items-center w-full">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
            <Icon className="h-4 w-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`w-full rounded-xl text-sm transition-all duration-200 bg-white text-slate-900 border border-slate-300 placeholder:text-slate-400 dark:bg-white/[0.04] dark:text-slate-100 dark:border-white/10 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${
            Icon ? "pl-10" : "pl-3.5"
          } ${IconRight ? "pr-10" : "pr-3.5"} py-2.5 ${
            error
              ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
              : "focus:border-indigo-500/80 dark:focus:border-indigo-500/60"
          } ${className}`}
          {...props}
        />

        {IconRight && (
          <button
            type="button"
            tabIndex={onRightIconClick ? 0 : -1}
            onClick={onRightIconClick}
            className={`absolute right-3 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 ${
              onRightIconClick ? "cursor-pointer" : "pointer-events-none"
            }`}
          >
            <IconRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {error && (
        <span id={`${inputId}-error`} className="text-xs text-rose-600 dark:text-rose-400 font-medium animate-fadeIn">
          {error}
        </span>
      )}
    </div>
  );
});

export default Input;
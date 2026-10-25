import type { ComponentProps, ReactNode } from "react";
import { inputClass } from "@/features/auth/ui/components/field-styles";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "./icons";

type FieldShellProps = {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
};

function FieldShell({ id, label, required, error, children }: FieldShellProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-small leading-tight">
        {label}
        {required && (
          <span aria-hidden="true" className="text-primary">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-micro text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

type TextFieldProps = Omit<ComponentProps<"input">, "id"> & {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  /** Sufixo fixo dentro do campo (ex.: .eth). */
  suffix?: string;
};

export function TextField({
  id,
  label,
  required,
  error,
  suffix,
  className,
  ...props
}: TextFieldProps) {
  return (
    <FieldShell id={id} label={label} required={required} error={error}>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(inputClass, suffix && "pr-14", error && "border-destructive", className)}
          {...props}
        />
        {suffix && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-small text-muted-foreground"
          >
            {suffix}
          </span>
        )}
      </div>
    </FieldShell>
  );
}

export type SelectOption = { value: string; label: string; disabled?: boolean };

type TextAreaFieldProps = Omit<ComponentProps<"textarea">, "id"> & {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
};

export function TextAreaField({
  id,
  label,
  required,
  error,
  className,
  ...props
}: TextAreaFieldProps) {
  return (
    <FieldShell id={id} label={label} required={required} error={error}>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(inputClass, "min-h-28 resize-y", error && "border-destructive", className)}
        {...props}
      />
    </FieldShell>
  );
}
type SelectFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  /** Texto auxiliar abaixo do campo, quando não há erro. */
  hint?: string;
  placeholder?: string;
  options: readonly SelectOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function SelectField({
  id,
  label,
  required,
  error,
  hint,
  placeholder,
  options,
  value,
  onChange,
  disabled,
}: SelectFieldProps) {
  return (
    <FieldShell id={id} label={label} required={required} error={error}>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            inputClass,
            "appearance-none pr-10",
            error && "border-destructive",
            disabled && "opacity-60",
          )}
        >
          {placeholder && (
            <option value="" disabled className="bg-card">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className="bg-card"
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
      </div>
      {!error && hint && <p className="text-micro text-muted-foreground">{hint}</p>}
    </FieldShell>
  );
}

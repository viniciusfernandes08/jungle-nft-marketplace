import { forwardRef, useId, useState, type ComponentProps } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

export const accountInputClass =
  "h-10 w-full rounded-[4px] border border-primary/30 bg-transparent px-3 text-small text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-destructive";

type FieldShellProps = {
  id: string;
  label: string;
  required?: boolean;
  labelHidden?: boolean;
  error?: string;
  gapClassName?: string;
  children: React.ReactNode;
};

function FieldShell({
  id,
  label,
  required,
  labelHidden,
  error,
  gapClassName = "gap-4",
  children,
}: FieldShellProps) {
  return (
    <div className={cn("flex min-w-0 flex-col", gapClassName)}>
      <label htmlFor={id} className={cn("text-small leading-tight", labelHidden && "sr-only")}>
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

type AccountFieldProps = Omit<ComponentProps<"input">, "id"> & {
  id: string;
  label: string;
  required?: boolean;
  labelHidden?: boolean;
  error?: string;
  dense?: boolean;
};

export const AccountField = forwardRef<HTMLInputElement, AccountFieldProps>(
  function AccountField(
    { id, label, required, labelHidden, error, dense, className, ...props },
    ref,
  ) {
    return (
      <FieldShell
        id={id}
        label={label}
        required={required}
        labelHidden={labelHidden}
        error={error}
        gapClassName={dense ? "gap-0.5" : "gap-4"}
      >
        <input
          ref={ref}
          id={id}
          className={cn(accountInputClass, className)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-required={required || undefined}
          {...props}
        />
      </FieldShell>
    );
  },
);

type SelectOption = { value: string; label: string };

type AccountSelectProps = Omit<ComponentProps<"select">, "id"> & {
  id: string;
  label: string;
  required?: boolean;
  labelHidden?: boolean;
  error?: string;
  options: readonly SelectOption[];
  dense?: boolean;
};

export const AccountSelect = forwardRef<HTMLSelectElement, AccountSelectProps>(
  function AccountSelect(
    { id, label, required, labelHidden, error, options, dense, className, ...props },
    ref,
  ) {
    return (
      <FieldShell
        id={id}
        label={label}
        required={required}
        labelHidden={labelHidden}
        error={error}
        gapClassName={dense ? "gap-0.5" : "gap-4"}
      >
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={cn(accountInputClass, "appearance-none pr-9", className)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            aria-required={required || undefined}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Icon
            name="chevron-down"
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
        </div>
      </FieldShell>
    );
  },
);

type AccountPasswordFieldProps = Omit<ComponentProps<"input">, "id" | "type"> & {
  id?: string;
  label: string;
  required?: boolean;
  error?: string;
};

export const AccountPasswordField = forwardRef<HTMLInputElement, AccountPasswordFieldProps>(
  function AccountPasswordField(
    { id, label, required, error, className, ...props },
    ref,
  ) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const [visible, setVisible] = useState(false);

    return (
      <FieldShell
        id={inputId}
        label={label}
        required={required}
        error={error}
        gapClassName="gap-3"
      >
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={visible ? "text" : "password"}
            className={cn(accountInputClass, "pr-11", className)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
            aria-required={required || undefined}
            {...props}
          />
          <button
            type="button"
            aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
            onClick={() => setVisible((current) => !current)}
            className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center text-muted-foreground transition-colors hover:text-primary"
          >
            <Icon name={visible ? "eye-off" : "eye"} className="size-4" />
          </button>
        </div>
      </FieldShell>
    );
  },
);

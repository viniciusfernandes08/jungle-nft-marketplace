import { useId, useState, type ComponentProps } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { inputClass } from "./field-styles";

type Props = Omit<ComponentProps<"input">, "type"> & { label: string; error?: string };

export function PasswordField({ label, error, id, className, ...props }: Props) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          placeholder={label}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(inputClass, "pr-12", className)}
          {...props}
        />
        <button
          type="button"
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded text-primary/70"
        >
          <Icon name={visible ? "eye" : "eye-off"} className="size-5" />
        </button>
      </div>
      {error && (
        <p id={errorId} className="mt-1 text-micro text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

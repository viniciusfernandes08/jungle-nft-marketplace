import { useId, type ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { inputClass } from "./field-styles";

type Props = ComponentProps<"input"> & { label: string; error?: string };

/** O rótulo é lido por leitores de tela; visualmente o Figma usa só o placeholder. */
export function TextField({ label, error, id, className, ...props }: Props) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;

  return (
    <div>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <input
        id={inputId}
        placeholder={label}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(inputClass, className)}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-micro text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

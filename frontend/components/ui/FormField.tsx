import { ReactNode, useId } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: (fieldProps: {
    id: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
    required?: boolean;
  }) => ReactNode;
}

export default function FormField({
  label,
  error,
  hint,
  required,
  children,
}: FormFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink-950">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-seal-600">
            *
          </span>
        )}
      </label>
      {hint && (
        <p id={hintId} className="text-xs text-ink-500">
          {hint}
        </p>
      )}
      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": Boolean(error),
        required,
      })}
      {error && (
        <p id={errorId} role="alert" className="text-sm font-medium text-seal-600">
          {error}
        </p>
      )}
    </div>
  );
}

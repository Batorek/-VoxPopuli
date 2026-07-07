import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  isLoading?: boolean;
}

const variantClasses: Record<string, string> = {
  primary: "bg-seal-500 text-paper-50 hover:bg-seal-600 disabled:bg-seal-500/50",
  secondary:
    "border border-ink-950 text-ink-950 hover:bg-ink-950 hover:text-paper-50 disabled:opacity-50",
  ghost: "text-ink-700 hover:bg-paper-200 disabled:opacity-50",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", isLoading, className = "", children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 rounded px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading && (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export default Button;

import { InputHTMLAttributes, forwardRef } from "react";

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full rounded border border-ink-300 bg-paper-50 px-3 py-2.5 text-base text-ink-950 placeholder:text-ink-300 aria-[invalid=true]:border-seal-500 ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export default Input;

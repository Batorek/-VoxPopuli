import { TextareaHTMLAttributes, forwardRef } from "react";

const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = "", ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={`w-full rounded border border-ink-300 bg-paper-50 px-3 py-2.5 text-base text-ink-950 placeholder:text-ink-300 aria-[invalid=true]:border-seal-500 ${className}`}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export default Textarea;

import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-4",
    lg: "w-16 h-16 border-[6px]",
  };

  return (
    <div className="flex justify-center items-center my-4">
      <div
        className={cn(
          "animate-spin rounded-full border-primary border-t-transparent",
          sizeClasses[size],
          className
        )}
        role="status"
        aria-live="polite"
        aria-label="Loading..."
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}

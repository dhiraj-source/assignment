import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils"; // if you have className utility

export function TagInput({ value = [], onChange, placeholder ,className}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
      e.preventDefault();
      onChange([...(value || []), e.currentTarget.value.trim()]);
      e.currentTarget.value = "";
    }
  };

  const removeTag = (idx: number) => {
    onChange(value.filter((_: any, i: number) => i !== idx));
  };

  return (
    <div
      // className={cn(
      //   "flex flex-wrap items-center gap-2 rounded-md border px-2 py-1 min-h-[42px]",
      //   "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      // )}
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                className
              )}
    >
      {value?.map((tag: string, idx: number) => (
        <div
          key={idx}
          className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-sm"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(idx)}
            className="text-muted-foreground hover:text-destructive"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <input
        type="text"
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 border-0 bg-transparent outline-none focus:ring-0 text-sm"
      />
    </div>
  );
}

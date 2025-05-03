import React, { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  placeholder?: string;
  className?: string;
}

const TagInput: React.FC<TagInputProps> = ({
  value = {},
  onChange,
  placeholder = "Add tag (key=value)",
  className,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();

      // Parse key=value format
      const parts = inputValue.split("=");
      const key = parts[0].trim();
      const val = parts.length > 1 ? parts.slice(1).join("=").trim() : "";

      if (key) {
        const newTags = { ...value, [key]: val };
        onChange(newTags);
        setInputValue("");
      }
    }
  };

  const removeTag = (keyToRemove: string) => {
    const newTags = { ...value };
    delete newTags[keyToRemove];
    onChange(newTags);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2 mb-2">
        {Object.entries(value).map(([key, val]) => (
          <Badge key={key} variant="secondary" className="px-2 py-1 text-xs">
            {key}
            {val ? `=${val}` : ""}
            <X
              className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
              onClick={() => removeTag(key)}
            />
          </Badge>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full"
      />
      <p className="text-xs text-muted-foreground mt-1">
        Press Enter to add a tag in key=value format
      </p>
    </div>
  );
};

export { TagInput };

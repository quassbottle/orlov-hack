import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface SortDropdownProps {
  onSortChange: (order: "asc" | "desc") => void;
}

export default function SortDropdown({ onSortChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("Старые");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options: { label: string; value: "asc" | "desc" }[] = [
    { label: "Старые", value: "asc" },
    { label: "Новые", value: "desc" },
  ];

  const handleOutsideClick = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем всплытие события
    setOpen((prev) => !prev);
  };

  const handleSelect = (label: string, value: "asc" | "desc") => {
    setSelected(label);
    setOpen(false);
    onSortChange(value);
  };

  return (
    <div ref={dropdownRef} className="relative inline-block w-36">
      <button
        type="button"
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium bg-gray-800 text-white rounded-md shadow hover:bg-gray-700 transition"
        onClick={handleButtonClick}
      >
        <span className="truncate">{selected}</span>
        {open ? (
          <ChevronUp className="ml-2 shrink-0" />
        ) : (
          <ChevronDown className="ml-2 shrink-0" />
        )}
      </button>

      {open && (
        <div className="absolute z-10 mt-2 w-full bg-gray-800 rounded-md shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(option.label, option.value);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 text-white"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

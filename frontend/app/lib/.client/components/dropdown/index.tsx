import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const SortDropdown = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('Старые');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options = ['Старые', 'Новые'];

  const handleOutsideClick = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left w-36">
      <button
        className="inline-flex justify-between items-center w-full px-4 py-2 text-sm font-medium bg-gray-800 text-white rounded-md shadow hover:bg-gray-700 transition"
        onClick={() => setOpen(!open)}
      >
        <span className="truncate">{selected}</span>
        {open ? <ChevronUp className="ml-2" /> : <ChevronDown className="ml-2" />}
      </button>

      {open && (
        <div className="absolute z-10 mt-2 w-full bg-gray-800 rounded-md shadow-lg">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                setSelected(option);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 text-white"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortDropdown;

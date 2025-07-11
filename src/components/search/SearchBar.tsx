// Import React's useState hook to manage local state (the text in the input)
import { useState } from "react";

// Import icons from lucide-react (X = clear, Search = magnifying glass)
import { X, Search } from "lucide-react";

// Define the type for the component props
type SearchInputProps = {
  placeholder?: string; // Optional placeholder text for the input
  onSearch?: (value: string) => void; // Optional callback when search is triggered
  onClear?: () => void; // Optional callback when input is cleared
};

// Define and export the functional component
export default function SearchInput({ placeholder, onSearch, onClear }: SearchInputProps) {
  // React state to track the current value of the input field
  const [value, setValue] = useState("");

  // Function to handle the search action (called when user clicks the search icon)
  const handleSearch = () => {
    if (onSearch) onSearch(value); // Trigger the onSearch prop function if it's provided
  };

  // Function to handle clearing the input field
  const handleClear = () => {
    setValue(""); // Reset the input to an empty string
    if (onClear) onClear(); // Trigger the onClear prop function if it's provided
  };

  return (
    // Container for the input and icons
    <div className="relative w-full max-w flex items-center bg-white px-4 py-2 rounded shadow">
      
      {/* Search input field */}
      <input
        type="text"
        placeholder={placeholder} // Use passed-in placeholder
        value={value} // Bind the input value to local state
        onChange={(e) => setValue(e.target.value)} // Update state when user types
        className="w-md h-[45px] text-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 pl-4"
        // pr-10 = padding right to make space for the icons
      />

      {/* "X" button to clear input, only shows if there's text */}
      {value && (
        <button
          onClick={handleClear} // Clear input when clicked
          className="absolute right-10 text-gray-500 hover:text-red-500"
        >
          <X size={18} /> {/* X icon */}
        </button>
      )}

      {/* Search button (magnifying glass icon) */}
      <button
        onClick={handleSearch} // Call search handler when clicked
        className="absolute right-2 top-1/2 transform text-white bg-blue-500 -translate-y-1/2 hover:bg-blue-600  h-[40px] w-[40px] flex items-center justify-center rounded "
      >
        <Search size={18} /> {/* Magnifying glass icon */}
      </button>
    </div>
  );
}

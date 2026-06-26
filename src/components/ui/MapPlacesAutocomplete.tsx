import React, { useState, useEffect } from 'react';

interface MapPlacesAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  className?: string;
  icon?: React.ReactNode;
  fieldName: 'pickup' | 'dropoff';
}

export const MapPlacesAutocomplete: React.FC<MapPlacesAutocompleteProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
  icon,
  fieldName,
}) => {
  const [inputValue, setInputValue] = useState(value);

  // Sync internal state with outer value prop
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    
    // Save to local storage for persistence & booking linkage
    if (fieldName === 'pickup') {
      localStorage.setItem('elitedrive_pickup_location', val);
    } else {
      localStorage.setItem('elitedrive_dropoff_location', val);
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative flex items-center group">
        {icon}
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`${className} w-full`}
        />
      </div>
    </div>
  );
};

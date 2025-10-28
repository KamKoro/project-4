import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

const UNITS = [
  // Volume units
  { value: 'tsp', label: 'tsp (teaspoon)', category: 'Volume' },
  { value: 'tbsp', label: 'tbsp (tablespoon)', category: 'Volume' },
  { value: 'cup', label: 'cup', category: 'Volume' },
  { value: 'ml', label: 'ml (milliliter)', category: 'Volume' },
  { value: 'l', label: 'l (liter)', category: 'Volume' },
  { value: 'fl oz', label: 'fl oz (fluid ounce)', category: 'Volume' },
  { value: 'pt', label: 'pt (pint)', category: 'Volume' },
  { value: 'qt', label: 'qt (quart)', category: 'Volume' },
  { value: 'gal', label: 'gal (gallon)', category: 'Volume' },
  
  // Weight units
  { value: 'g', label: 'g (gram)', category: 'Weight' },
  { value: 'kg', label: 'kg (kilogram)', category: 'Weight' },
  { value: 'oz', label: 'oz (ounce)', category: 'Weight' },
  { value: 'lb', label: 'lb (pound)', category: 'Weight' },
  
  // Count units
  { value: 'piece', label: 'piece', category: 'Count' },
  { value: 'clove', label: 'clove', category: 'Count' },
  { value: 'slice', label: 'slice', category: 'Count' },
  { value: 'whole', label: 'whole', category: 'Count' },
  { value: 'pinch', label: 'pinch', category: 'Count' },
  { value: 'dash', label: 'dash', category: 'Count' },
  
  // Length units
  { value: 'inch', label: 'inch', category: 'Length' },
  { value: 'cm', label: 'cm (centimeter)', category: 'Length' },
  
  // Other
  { value: 'can', label: 'can', category: 'Other' },
  { value: 'package', label: 'package', category: 'Other' },
  { value: 'bunch', label: 'bunch', category: 'Other' },
  { value: 'head', label: 'head', category: 'Other' },
  { value: 'to taste', label: 'to taste', category: 'Other' },
];

const UnitsSelector = ({ onSelect, selectedUnit, onClear, placeholder = "Select unit..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUnits = UNITS.filter(unit =>
    unit.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (unit) => {
    onSelect(unit);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onClear();
    setIsOpen(false);
    setSearchTerm('');
  };

  const groupedUnits = filteredUnits.reduce((groups, unit) => {
    const category = unit.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(unit);
    return groups;
  }, {});

  return (
    <div className="relative">
      <div className="flex">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 input-field text-left flex items-center justify-between"
        >
          <span className={selectedUnit ? 'text-gray-900' : 'text-gray-500'}>
            {selectedUnit ? selectedUnit.label : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>
        
        {selectedUnit && (
          <button
            type="button"
            onClick={handleClear}
            className="ml-2 p-2 text-gray-400 hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search units..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Units List */}
          <div className="max-h-60 overflow-y-auto">
            {Object.keys(groupedUnits).length > 0 ? (
              <div className="py-1">
                {Object.entries(groupedUnits).map(([category, units]) => (
                  <div key={category}>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-100">
                      {category}
                    </div>
                    {units.map((unit) => (
                      <button
                        key={unit.value}
                        type="button"
                        onClick={() => handleSelect(unit)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      >
                        <span className="text-gray-900">{unit.label}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p>No units found</p>
                {searchTerm && (
                  <p className="text-sm mt-1">Try a different search term</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitsSelector;

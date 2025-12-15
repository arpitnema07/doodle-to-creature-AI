import React from 'react';
import { BrushColor } from '../types';

interface ControlsProps {
  currentColor: BrushColor;
  onColorChange: (color: BrushColor) => void;
  onClear: () => void;
  disabled: boolean;
}

const Controls: React.FC<ControlsProps> = ({ currentColor, onColorChange, onClear, disabled }) => {
  return (
    <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200 shadow-sm mt-4">
      <div className="flex gap-2">
        {Object.values(BrushColor).map((color) => (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            disabled={disabled}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
              currentColor === color 
                ? 'border-indigo-500 scale-110 shadow-sm' 
                : 'border-transparent hover:scale-105'
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
      
      <div className="h-6 w-px bg-slate-200 mx-2"></div>

      <button
        onClick={onClear}
        disabled={disabled}
        className="text-slate-500 hover:text-red-500 text-sm font-medium px-2 transition-colors disabled:opacity-50"
      >
        Clear
      </button>
    </div>
  );
};

export default Controls;
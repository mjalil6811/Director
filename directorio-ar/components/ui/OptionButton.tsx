'use client';

interface OptionButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export default function OptionButton({ label, selected, onClick, disabled }: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-150 text-sm font-medium
        ${selected
          ? 'border-[#534AB7] bg-[#534AB7] text-white shadow-sm'
          : 'border-gray-200 bg-white text-gray-700 hover:border-[#534AB7] hover:bg-purple-50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {label}
    </button>
  );
}

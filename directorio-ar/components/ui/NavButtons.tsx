'use client';

interface NavButtonsProps {
  onPrev?: () => void;
  onNext?: () => void;
  prevLabel?: string;
  nextLabel?: string;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  showPrev?: boolean;
}

export default function NavButtons({
  onPrev,
  onNext,
  prevLabel = 'Anterior',
  nextLabel = 'Siguiente',
  prevDisabled = false,
  nextDisabled = false,
  showPrev = true,
}: NavButtonsProps) {
  return (
    <div className="flex justify-between items-center mt-6 gap-3">
      {showPrev ? (
        <button
          onClick={onPrev}
          disabled={prevDisabled}
          className={`px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors
            ${prevDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {prevLabel}
        </button>
      ) : (
        <div />
      )}
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className={`px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-[#534AB7] hover:bg-[#3C3489] transition-colors
          ${nextDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {nextLabel}
      </button>
    </div>
  );
}

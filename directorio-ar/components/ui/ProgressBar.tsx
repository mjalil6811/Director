'use client';

interface ProgressBarProps {
  percentage: number;
  label?: string;
  color?: string;
}

export default function ProgressBar({ percentage, label, color = '#534AB7' }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percentage));
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-1 text-sm text-gray-600">
          <span>{label}</span>
          <span>{Math.round(clamped)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

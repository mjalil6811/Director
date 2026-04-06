'use client';

interface ResultCardProps {
  title: string;
  value: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'purple' | 'green' | 'yellow' | 'red' | 'gray';
  children?: React.ReactNode;
}

const badgeClasses = {
  purple: 'bg-purple-100 text-purple-700',
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-700',
  gray: 'bg-gray-100 text-gray-600',
};

export default function ResultCard({ title, value, subtitle, badge, badgeColor = 'purple', children }: ResultCardProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</h3>
        {badge && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${badgeClasses[badgeColor]}`}>
            {badge}
          </span>
        )}
      </div>
      <p className="text-xl font-bold text-gray-900 mb-1">{value}</p>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

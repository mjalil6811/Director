'use client';

interface QuestionCardProps {
  number: number;
  total: number;
  question: string;
  children: React.ReactNode;
}

export default function QuestionCard({ number, total, question, children }: QuestionCardProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-[#534AB7] bg-purple-50 px-2 py-1 rounded-full">
          {number} / {total}
        </span>
      </div>
      <h2 className="text-base font-semibold text-gray-900 mb-4 leading-snug">{question}</h2>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

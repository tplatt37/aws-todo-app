'use client';

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        <div className="size-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
}

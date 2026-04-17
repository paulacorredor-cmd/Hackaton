'use client';

interface ErrorMessageProps {
  message: string;
  fieldId?: string;
  ariaLive?: 'polite' | 'assertive';
}

export default function ErrorMessage({
  message,
  fieldId,
  ariaLive = 'polite',
}: ErrorMessageProps) {
  const errorId = fieldId ? `${fieldId}-error` : undefined;

  return (
    <p
      id={errorId}
      role="alert"
      aria-live={ariaLive}
      aria-atomic="true"
      className="text-red-600 text-sm mobile:text-mobile-min font-inter mt-1"
    >
      {message}
    </p>
  );
}

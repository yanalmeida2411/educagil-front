import React from 'react';

interface ErrorAlertProps {
  message: string | null;
}

export default function ErrorAlert({ message }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <div
      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-6"
      role="alert"
      aria-live="assertive"
    >
      <strong className="font-bold">Erro:</strong>
      <span className="block sm:inline"> {message}</span>
    </div>
  );
}

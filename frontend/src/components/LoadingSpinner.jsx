import { memo } from 'react';

function LoadingSpinner({ message = 'Loading...', fullPage = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"
        role="status"
        aria-label="Loading"
      />
      {message && <p className="text-sm text-gray-500">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">{content}</div>
    );
  }

  return content;
}

export default memo(LoadingSpinner);

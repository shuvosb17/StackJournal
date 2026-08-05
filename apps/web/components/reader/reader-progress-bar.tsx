"use client";

type ReaderProgressBarProps = {
  progress: number;
};

export function ReaderProgressBar({ progress }: ReaderProgressBarProps) {
  return (
    <div className="reader-progress-track" aria-hidden>
      <div
        className="reader-progress-fill"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}

"use client";

type ReaderProgressBarProps = {
  progress: number;
};

export function ReaderProgressBar({ progress }: ReaderProgressBarProps) {
  const scale = Math.min(100, Math.max(0, progress)) / 100;

  return (
    <div className="reader-progress-track" aria-hidden>
      <div
        className="reader-progress-fill"
        style={{ "--reader-progress": scale } as React.CSSProperties}
      />
    </div>
  );
}

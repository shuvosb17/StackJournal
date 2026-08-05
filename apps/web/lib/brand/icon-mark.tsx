type IconMarkProps = {
  scale?: number;
  pad?: number;
  /** Extra inset for Android/Chrome maskable icons (content stays in the center 80%). */
  maskable?: boolean;
};

/** Shared brand mark for favicon, Apple touch icon, and PWA manifest. */
export function IconMark({
  scale = 1,
  pad = 0,
  maskable = false,
}: IconMarkProps) {
  const barWidth = 200 * scale;
  const barHeight = 26 * scale;
  const gap = 14 * scale;
  const radii = [22, 18, 14].map((r) => r * scale);
  const inset = maskable ? Math.max(pad, 96 * scale) : pad;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: inset,
        background:
          "linear-gradient(145deg, #2f2c28 0%, #1c1b19 48%, #141312 100%)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap,
        }}
      >
        {[0.95, 0.72, 0.52].map((opacity, index) => (
          <div
            key={index}
            style={{
              width: barWidth - index * 34 * scale,
              height: barHeight,
              borderRadius: radii[index],
              background: `rgba(236, 228, 214, ${opacity})`,
              boxShadow: "0 8px 28px rgba(0, 0, 0, 0.22)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export const BRAND = {
  name: "StackJournal",
  shortName: "StackJournal",
  themeColor: "#1c1b19",
  backgroundColor: "#1c1b19",
  description:
    "Your personal engineering reading room — curated articles, learning paths, and case studies.",
} as const;

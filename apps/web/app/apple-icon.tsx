import { ImageResponse } from "next/og";

import { IconMark } from "@/lib/brand/icon-mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<IconMark scale={0.42} pad={22} />, {
    ...size,
  });
}

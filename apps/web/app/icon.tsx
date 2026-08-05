import { ImageResponse } from "next/og";

import { IconMark } from "@/lib/brand/icon-mark";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<IconMark scale={1.15} pad={56} />, {
    ...size,
  });
}

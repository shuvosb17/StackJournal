import { ImageResponse } from "next/og";

import { IconMark } from "@/lib/brand/icon-mark";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(<IconMark scale={0.9} pad={72} maskable />, {
    width: 512,
    height: 512,
  });
}

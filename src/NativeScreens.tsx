import { CryptoScreen } from "./CryptoScreens";
import { CreatorScreen } from "./CreatorScreens";
import { WorkScreen } from "./WorkScreens";
import { type ScreenProps } from "./NativeUI";
import "./native.css";
export function NativeScreen(p: ScreenProps) {
  return p.kind === "crypto" ? (
    <CryptoScreen {...p} />
  ) : ["instagram", "youtube", "tiktok", "streaming"].includes(p.kind) ? (
    <CreatorScreen {...p} />
  ) : (
    <WorkScreen {...p} />
  );
}

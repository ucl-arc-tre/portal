import dynamic from "next/dynamic";

export const XIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.X), {
  ssr: false,
});

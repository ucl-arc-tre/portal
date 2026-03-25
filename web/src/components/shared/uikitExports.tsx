import dynamic from "next/dynamic";
//  ICONS
export const XIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.X), {
  ssr: false,
});

export const InfoIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.Info), {
  ssr: false,
});

export const AlertCircleIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.AlertCircle), {
  ssr: false,
});

//  COMPONENTS
export const Input = dynamic(() => import("uikit-react-public").then((mod) => mod.Input), {
  ssr: false,
});

export const Label = dynamic(() => import("uikit-react-public").then((mod) => mod.Label), {
  ssr: false,
});

export const Alert = dynamic(() => import("uikit-react-public").then((mod) => mod.Alert), {
  ssr: false,
});

export const AlertMessage = dynamic(() => import("uikit-react-public").then((mod) => mod.Alert.Message), {
  ssr: false,
});

export const CheckIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.Check), {
  ssr: false,
});

export const HelperText = dynamic(() => import("uikit-react-public").then((mod) => mod.Field.HelperText), {
  ssr: false,
});

export const Textarea = dynamic(() => import("uikit-react-public").then((mod) => mod.Textarea), {
  ssr: false,
});

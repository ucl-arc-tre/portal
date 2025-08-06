import dynamic from "next/dynamic";

export const XIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.X), {
  ssr: false,
});

export const InfoIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.Info), {
  ssr: false,
});

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

export const TrainingKindOptions = {
  //  is there a better way of doing this? Won't let me use type as a value
  nhsd: "training_kind_nhsd",
};

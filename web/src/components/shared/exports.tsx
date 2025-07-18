import dynamic from "next/dynamic";

export const XIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.X), {
  ssr: false,
});

export const InfoIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.Info), {
  ssr: false,
});

export const TrainingKindOptions = {
  //  is there a better way of doing this? Won't let me use type as a value
  nhsd: "training_kind_nhsd",
};

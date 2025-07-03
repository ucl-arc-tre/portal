import { TrainingKindOptions } from "@/components/assets/exports";

export function getHumanReadableTrainingKind(trainingKind: string) {
  // getting the key from the value
  const humanReadableTrainingKind = Object.entries(TrainingKindOptions).find(
    ([, value]) => value === trainingKind
  )?.[0];

  return humanReadableTrainingKind;
}

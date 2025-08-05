type Step = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
};

type StepProgressProps = {
  steps: Step[];
  isComplete?: boolean;
  completionTitle?: string;
  completionSubtitle?: string;
  completionButtonText?: string;
  completionButtonHref?: string;
  introText?: string;
  ariaLabel?: string;
};

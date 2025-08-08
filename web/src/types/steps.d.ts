type Step = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  expiryUrgency: ExpiryUrgency | null;
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
  expiryUrgency?: ExpiryUrgency | null;
};

type ExpiryUrgency = {
  level: "low" | "medium" | "high";
};

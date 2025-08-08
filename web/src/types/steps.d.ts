// a generic type for completing the 'steps' involved in various aspects of the portal (e.g. profile steps, study steps etc.)
type Step = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  expiryUrgency?: ExpiryUrgency | null;
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

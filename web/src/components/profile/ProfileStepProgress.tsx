import StepProgress from "../ui/StepProgress";

type ProfileStepProgressProps = {
  steps: ProfileStep[];
  profileIsComplete?: boolean;
};

export default function ProfileStepProgress(props: ProfileStepProgressProps) {
  const { steps, profileIsComplete } = props;

  // Convert ProfileStep[] to Step[]
  const genericSteps: Step[] = steps.map((step) => ({
    id: step.id,
    title: step.title,
    description: step.description,
    completed: step.completed,
    current: step.current,
  }));

  return (
    <StepProgress
      steps={genericSteps}
      isComplete={profileIsComplete}
      completionTitle="Profile Complete!"
      completionSubtitle="You have successfully completed all profile setup steps and are now an approved researcher. You can now create and manage studies."
      completionButtonText="Go to studies"
      completionButtonHref="/studies"
      introText="Complete the following steps to set up your profile and become an approved researcher."
      ariaLabel="Profile setup progress"
    />
  );
}

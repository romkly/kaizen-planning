export const ONBOARDING_STEPS = [
    "brainstorm",
    "categorize",
    "priorities",
    "vision",
    "year",
    "month",
  ] as const;
  
  export type OnboardingStep =
    (typeof ONBOARDING_STEPS)[number];
  
  export function canAccessStep(
    currentStep: OnboardingStep,
    requestedStep: OnboardingStep,
  ) {
    return (
      ONBOARDING_STEPS.indexOf(requestedStep) <=
      ONBOARDING_STEPS.indexOf(currentStep)
    );
  }
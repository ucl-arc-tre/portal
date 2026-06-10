export const TrainingKindOptions = {
  //  is there a better way of doing this? Won't let me use type as a value
  "NHS Digital E-learning for Health": "training_kind_nhsd",
  "UCLH Information Governance": "training_kind_uclh_ig",
};

// UTILITY FUNCTIONS
export function convertRFC3339ToDDMMYYYY(dateString: string) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

export function getHumanReadableTrainingKind(trainingKind: string) {
  // getting the key from the value
  const humanReadableTrainingKind = Object.entries(TrainingKindOptions).find(
    ([, value]) => value === trainingKind
  )?.[0];

  return humanReadableTrainingKind;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function studySignoffWarningRequired(lastSignoff: string): boolean {
  const validityDays = 90;
  const warningThresholdDays = 30;

  const lastSignoffDate = new Date(lastSignoff); // e.g. "2024-01-01"
  const millisecondsDiff = Date.now() - lastSignoffDate.getTime(); // e.g. 90 days (in milliseconds)
  const daysSinceSignoff = Math.floor(millisecondsDiff / MS_PER_DAY); // e.g. 90 days
  const daysRemaining = validityDays - daysSinceSignoff; // e.g. 0 days remaining

  return daysRemaining <= warningThresholdDays;
}

export function calculateExpiryUrgency(expiryDate: Date): ExpiryUrgency | null {
  const today = new Date();
  const timeUntilExpiry = expiryDate.getTime() - today.getTime();
  const daysUntilExpiry = Math.ceil(timeUntilExpiry / MS_PER_DAY);

  let expiryUrgency: ExpiryUrgency | null = null;
  if (daysUntilExpiry > 90) {
    expiryUrgency = null;
  } else if (daysUntilExpiry <= 0) {
    expiryUrgency = { level: "critical" };
  } else if (daysUntilExpiry < 30) {
    expiryUrgency = { level: "high" };
  } else if (daysUntilExpiry >= 30 && daysUntilExpiry < 60) {
    expiryUrgency = { level: "medium" };
  } else if (daysUntilExpiry >= 60 && daysUntilExpiry <= 90) {
    expiryUrgency = { level: "low" };
  }
  return expiryUrgency;
}

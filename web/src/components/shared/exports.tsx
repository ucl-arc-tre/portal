export const TrainingKindOptions = {
  //  is there a better way of doing this? Won't let me use type as a value
  nhsd: "training_kind_nhsd",
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

export function calculateExpiryUrgency(expiryDate: Date): ExpiryUrgency | null {
  // needs to work for expiration in the future, used by assets and contracts,  and also account for complation date + 1yr being expiry for certificates

  const today = new Date();

  const timeUntilExpiry = expiryDate.getTime() - today.getTime();
  const daysUntilExpiry = Math.ceil(timeUntilExpiry / (1000 * 60 * 60 * 24));

  let expiryUrgency: ExpiryUrgency | null = null;
  if (daysUntilExpiry > 90) {
    expiryUrgency = null;
  } else if (daysUntilExpiry < 30) {
    expiryUrgency = { level: "high" };
  } else if (daysUntilExpiry >= 30 && daysUntilExpiry < 60) {
    expiryUrgency = { level: "medium" };
  } else if (daysUntilExpiry >= 60 && daysUntilExpiry <= 90) {
    expiryUrgency = { level: "low" };
  }
  return expiryUrgency;
}

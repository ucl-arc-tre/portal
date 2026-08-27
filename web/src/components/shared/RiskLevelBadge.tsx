import styles from "./RiskClassificationBadge.module.css";
import { getRiskClassification, riskScoreMax } from "../../lib/riskScoreCalculations";
import Badge from "../ui/Badge";

export default function RiskClassificationBadge({ riskScore, isIGStaff }: { riskScore: number; isIGStaff: boolean }) {
  const riskClassification = getRiskClassification(riskScore);

  return (
    <Badge className={`${styles[`risk-classification-${riskClassification}`]}`} cy="risk-badge">
      {riskClassification} {isIGStaff && `(${riskScore}/${riskScoreMax})`}
    </Badge>
  );
}

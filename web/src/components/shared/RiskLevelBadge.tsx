import styles from "./RiskLevelBadge.module.css";
import { getRiskLevel, riskScoreMax } from "../../lib/riskScoreCalculations";
import Badge from "../ui/Badge";

export default function RiskLevelBadge({ riskScore, isIGStaff }: { riskScore: number; isIGStaff: boolean }) {
  const riskLevel = getRiskLevel(riskScore);

  return (
    <Badge className={`${styles[`risk-level-${riskLevel}`]}`} cy="risk-badge">
      {riskLevel} {isIGStaff && `(${riskScore}/${riskScoreMax})`}
    </Badge>
  );
}

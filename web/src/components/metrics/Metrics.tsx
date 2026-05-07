import { getUsersMetrics, UserMetrics } from "@/openapi";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import { useEffect, useState } from "react";
import { Label, Pie, PieChart, Tooltip } from "recharts";
import styles from "./Metrics.module.css";

export default function Metrics() {
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<UserMetrics | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserMetrics = async () => {
      setIsLoading(true);
      try {
        const response = await getUsersMetrics();
        if (responseIsError(response) || !response.data) {
          const errorMsg = extractErrorMessage(response);
          setError(`Failed to load metrics: ${errorMsg}`);
          return;
        }
        setMetrics(response.data);
      } catch (err) {
        console.error("Failed to load metrics:", err);
        setError("Failed to load metrics. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserMetrics();
  }, [setMetrics]);

  const num_total = metrics?.total || 0;
  const num_valid_training = metrics?.num_approved_researchers_valid_training || 0;
  const num_expired_training = metrics?.num_approved_researchers_expired_training || 0;
  const num_other = num_total - num_valid_training - num_expired_training;

  const data = [
    { name: "Has valid training", value: num_valid_training, fill: "#0088FE" },
    { name: "Does not have valid training", value: num_expired_training, fill: "#00C49F" },
    { name: "Not completed agreement and/or training", value: num_other, fill: "#FFBB28" },
  ];

  if (isLoading) return null;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.container}>
      <PieChart className={styles.chart} responsive>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius="50%"
          outerRadius="80%"
          label
          isAnimationActive={true}
        />
        <Label position="center">{`Total: ${num_total} `}</Label>
        <Tooltip />
      </PieChart>
      <p>Number of approved researchers with valid and invalid training</p>
    </div>
  );
}

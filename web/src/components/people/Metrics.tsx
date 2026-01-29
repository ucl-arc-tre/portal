import { getUsersMetrics, UserMetrics } from "@/openapi";
import { useEffect, useState } from "react";
import { Chart } from "react-google-charts";

export default function Metrics() {
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<UserMetrics | undefined>(undefined);

  useEffect(() => {
    const fetchUserMetrics = async () => {
      setIsLoading(true);
      try {
        const res = await getUsersMetrics();
        if (!res.response.ok) {
          throw new Error(`${res.response.status} response`);
        }
        setMetrics(res.data);
      } catch (err) {
        console.error("Failed to load metrics:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserMetrics();
  }, [setMetrics]);

  const num_valid_training = metrics?.num_approved_researchers_valid_training || 0;
  const num_expired_training = metrics?.num_approved_researcher_expired_training || 0;
  const num_other = (metrics?.total || 0) - num_valid_training - num_expired_training;

  const data = [
    ["Type", "Number"],
    ["Approved valid", num_valid_training],
    ["Approved expired", num_expired_training],
    ["Not approved", num_other],
  ];

  if (isLoading) return null;

  return (
    <>
      <Chart
        chartType="PieChart"
        data={data}
        options={{
          title: "Number of users approved researchers with valid and invalid training",
        }}
        width={"100%"}
        height={"400px"}
      />
    </>
  );
}

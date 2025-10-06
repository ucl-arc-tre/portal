import { useEffect, useState } from "react";
import { Study, getStudies } from "@/openapi";
import StudySelection from "../studies/StudySelection";
import Button from "../ui/Button";
import styles from "./StudiesAdmin.module.css";
import Loading from "../ui/Loading";

export default function StudiesAdmin() {
  const [tab, setTab] = useState("pending");
  const [studies, setStudies] = useState<Study[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPendingStudies = async () => {
    setIsLoading(true);
    try {
      const response = await getStudies({ query: { status: "Pending" } });
      if (response.response.ok && response.data) {
        setStudies(response.data);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Failed to get pending studies:", error);
    }
  };
  useEffect(() => {
    fetchPendingStudies();
  }, []);

  const handleAllStudiesClick = async () => {
    setTab("all");
    setIsLoading(true);
    const response = await getStudies();
    if (!response.response.ok) {
      console.error("Failed to get studies:", response.error);
    } else {
      setStudies(response.data || []);
      setIsLoading(false);
    }
  };

  const handlePendingStudiesClick = async () => {
    setTab("pending");
    fetchPendingStudies();
  };

  return (
    <>
      {tab === "pending" && <h2>Studies to Review</h2>}
      {tab === "all" && <h2>All Studies</h2>}

      <div className={styles["study-tabs"]}>
        <Button
          onClick={handlePendingStudiesClick}
          variant="secondary"
          className={`${styles.tab} ${styles["pending-studies-tab"]} ${tab === "pending" ? styles.active : ""}`}
        >
          Pending Studies
        </Button>
        <Button
          onClick={handleAllStudiesClick}
          variant="secondary"
          className={`${styles.tab} ${styles["all-studies-tab"]} ${tab === "all" ? styles.active : ""}`}
        >
          All Studies
        </Button>
      </div>

      {tab === "all" && <div>search bar</div>}

      {isLoading && <Loading message="Loading studies..." />}

      <StudySelection studies={studies} isAdmin={true} />
    </>
  );
}

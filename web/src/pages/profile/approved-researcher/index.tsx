import MetaHead from "@/components/meta/Head";
import ApprovedResearcherAgreement from "@/components/profile/approved-researcher/ApprovedResearcherAgreement";
import TrainingCertificate from "@/components/profile/approved-researcher/TrainingCertificate";
import styles from "./ApprovedResearcher.module.css";

export default function ApprovedResearcherPage() {
  return (
    <>
      <MetaHead
        title="Become an Approved Researcher | ARC Services Portal"
        description="Submit your application to become an approved researcher"
      />
      <div className={styles.page}>
        <h1>Become an Approved Researcher</h1>
        <h3>To gain access to advanced services, please complete the following steps.</h3>

        <TrainingCertificate />
        <hr />
        <ApprovedResearcherAgreement />
      </div>
    </>
  );
}

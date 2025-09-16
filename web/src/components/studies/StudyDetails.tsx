import { postStudiesByStudyId, Study } from "@/openapi";
import Box from "../ui/Box";
import { formatDate } from "../shared/exports";
import { useEffect, useState } from "react";
import StudyStatusBadge from "../ui/StudyStatusBadge";
import styles from "./StudyDetails.module.css";
import Button from "../ui/Button";

type StudyDetailsProps = {
  study: Study;
};
export default function StudyDetails({ study }: StudyDetailsProps) {
  const [riskScore, setRiskScore] = useState(0);
  // const getUserFromId = (id: string) => {
  //   // todo
  // };

  const handleUpdateStudyStatus = async (status: string) => {
    const studyId = study.id;

    if (status === "Approved") {
      // set as approved
      const response = await postStudiesByStudyId({ path: { studyId }, body: "Approved" });
      console.log(response);
    } else if (status === "Rejected") {
      // todo: add feedback bits
    }
  };
  const calculateRiskScore = () => {
    // todo: how to determine if they have data?
    let score = 0;

    if (study.involves_data_processing_outside_eea) score += 10;
    if (study.requires_dbs) score += 5;
    if (study.requires_dspt) score += 5;
    if (study.involves_third_party && !study.involves_mnca) score += 5;
    if (study.involves_nhs_england || study.involves_cag) score += 5;

    setRiskScore(score);
  };

  useEffect(() => {
    calculateRiskScore();
  });
  return (
    <>
      <Box>
        <div className={styles["pre-description"]}>
          <span>Last updated: {formatDate(study.updated_at)}</span>
          <span>Risk Score: {riskScore}</span>
          <StudyStatusBadge status={study.approval_status} isAdmin={true} />
        </div>
        <h2>{study.description}</h2>
        <div>
          <dl className={styles.ownership}>
            <dd>
              Owner: <span>{study.owner_user_id}</span>
            </dd>
            <dd>
              Admins:
              <span>{study.additional_study_admin_usernames}</span>
            </dd>
            <dd>
              Data Controller: <span>{study.data_controller_organisation.toUpperCase()}</span>
            </dd>
          </dl>
          <h3>Additional Information</h3>
          <p className={styles["additional-info"]}>
            <em>
              These details have all been marked as &ldquo;true&rdquo; in the form. Some can{" "}
              <span className={`${styles.badge} ${styles["badge-risk-associated"]}`}>contribute</span> to the risk
              score, whilst others do{" "}
              <span className={`${styles.badge} ${styles["badge-no-risk-associated"]}`}>not</span>.
            </em>
          </p>
          <dl className={styles.grouping}>
            <h4>Sponsorships & Approvals</h4>
            {study.involves_ucl_sponsorship && (
              <dd className={`${styles.badge} ${styles["badge-no-risk-associated"]}`}>UCL Sponsorship</dd>
            )}
            {study.involves_cag && (
              <dd className={`${styles.badge} ${styles["badge-risk-associated"]}`}>CAG approval</dd>
            )}
            {study.involves_ethics_approval && (
              <dd className={`${styles.badge} ${styles["badge-no-risk-associated"]}`}>Ethics approval</dd>
            )}
            {study.involves_hra_approval && (
              <dd className={`${styles.badge} ${styles["badge-no-risk-associated"]}`}>HRA approval</dd>
            )}
            {!study.involves_ucl_sponsorship &&
              !study.involves_cag &&
              !study.involves_ethics_approval &&
              !study.involves_hra_approval && (
                <dd>
                  {" "}
                  <em>No sponsorship or approval information given</em>
                </dd>
              )}
          </dl>
          <dl className={styles.grouping}>
            <h4>NHS</h4>
            {study.is_nhs_associated && (
              <dd className={`${styles.badge} ${styles["badge-no-risk-associated"]}`}>is NHS associated</dd>
            )}
            {study.involves_nhs_england && (
              <dd className={`${styles.badge} ${styles["badge-risk-associated"]}`}>NHS England involvement</dd>
            )}
            {study.involves_mnca && (
              <dd className={`${styles.badge} ${styles["badge-no-risk-associated"]}`}>involves MNCA</dd>
            )}
            {study.requires_dspt && (
              <dd className={`${styles.badge} ${styles["badge-risk-associated"]}`}>requires DSPT</dd>
            )}
            {!study.is_nhs_associated &&
              !study.involves_nhs_england &&
              !study.involves_mnca &&
              !study.requires_dspt && (
                <dd>
                  <em> No NHS information given</em>
                </dd>
              )}
          </dl>
          <dl className={styles.grouping}>
            <h4>Data</h4>
            {study.requires_dbs && (
              <dd className={`${styles.badge} ${styles["badge-risk-associated"]}`}>requires DBS</dd>
            )}
            {study.is_data_protection_office_registered && (
              <dd className={`${styles.badge} ${styles["badge-no-risk-associated"]}`}>is registered with DPO</dd>
            )}
            {study.involves_third_party && (
              <dd className={`${styles.badge} ${styles["badge-risk-associated"]}`}>third party</dd>
            )}
            {study.involves_external_users && (
              <dd className={`${styles.badge} ${styles["badge-no-risk-associated"]}`}>external users</dd>
            )}
            {study.involves_participant_consent && (
              <dd className={`${styles.badge} ${styles["badge-no-risk-associated"]}`}>participant consent</dd>
            )}
            {study.involves_indirect_data_collection && (
              <dd className={`${styles.badge} ${styles["badge-no-risk-associated"]}`}>indirect data collection</dd>
            )}
            {study.involves_data_processing_outside_eea && (
              <dd className={`${styles.badge} ${styles["badge-risk-associated"]}`}>data processing outside EEA</dd>
            )}
            {!study.requires_dbs &&
              !study.is_data_protection_office_registered &&
              !study.involves_third_party &&
              !study.involves_external_users &&
              !study.involves_participant_consent &&
              !study.involves_indirect_data_collection &&
              !study.involves_data_processing_outside_eea && (
                <dd>
                  <em>No data information given</em>
                </dd>
              )}
          </dl>
        </div>
      </Box>
      <div>
        <Button className={styles["approve-button"]} onClick={() => handleUpdateStudyStatus("Approved")}>
          Approve Study
        </Button>
        <Button variant="secondary" className={styles["reject-button"]}>
          Request Changes
        </Button>
      </div>
    </>
  );
}

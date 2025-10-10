import { postStudiesAdminByStudyIdReview, patchStudiesByStudyIdPending, Study } from "@/openapi";
import Box from "../ui/Box";
import { Alert, formatDate } from "../shared/exports";
import { useEffect, useState } from "react";
import StudyStatusBadge from "../ui/StudyStatusBadge";
import styles from "./StudyDetails.module.css";
import Button from "../ui/Button";
import InfoTooltip from "../ui/InfoTooltip";
import AdminFeedbackSection from "./AdminFeedbackSection";

type StudyDetailsProps = {
  study: Study;
  isAdmin: boolean;
  isStudyOwner: boolean;
  setStudyFormOpen?: (name: boolean) => void;
  studyStepsCompleted?: boolean;
};
export default function StudyDetails(props: StudyDetailsProps) {
  const { study, isAdmin, isStudyOwner, setStudyFormOpen, studyStepsCompleted } = props;
  const [riskScore, setRiskScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [approvalStatus, setApprovalStatus] = useState("");

  const handleUpdateStudyStatus = async (status: string) => {
    const studyId = study.id;

    if (status === "Approved") {
      const response = await postStudiesAdminByStudyIdReview({ path: { studyId }, body: { status: "Approved" } });
      if (response.response.ok) {
        setApprovalStatus("Approved");
      }
    } else if (status === "Rejected") {
      const response = await postStudiesAdminByStudyIdReview({
        path: { studyId },
        body: { status: "Rejected", feedback: feedback },
      });
      if (response.response.ok) {
        setApprovalStatus("Rejected");
      }
    } else if (status === "Pending") {
      const response = await patchStudiesByStudyIdPending({
        path: { studyId },
      });
      if (response.response.ok) {
        setApprovalStatus("Pending");
      }
    }
  };

  useEffect(() => {
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

    calculateRiskScore();
    setApprovalStatus(study.approval_status);
    if (study.feedback) setFeedback(study.feedback);
  }, [study]);

  const standardRiskScoreStatement = "increases risk score by 5";
  return (
    <>
      {isStudyOwner && setStudyFormOpen && (
        <div className={styles["study-actions"]}>
          <Button variant="secondary" size="small" onClick={() => setStudyFormOpen(true)}>
            {study.feedback ? "Respond to Feedback" : "Edit Study"}
          </Button>

          {studyStepsCompleted && (
            <Button onClick={() => handleUpdateStudyStatus("Pending")} size="small">
              Mark Ready for Review
            </Button>
          )}
        </div>
      )}

      <Box>
        <div className={styles["pre-description"]}>
          <span>
            Last updated: <span className={styles["grey-value"]}>{formatDate(study.updated_at)}</span>
          </span>
          <span>
            Risk Score: <span className={styles["risk-score"]}>{riskScore}</span>
          </span>
          <StudyStatusBadge status={approvalStatus} isAdmin={true} />
        </div>
        <h3 className={styles.description}>{study.description}</h3>
        <div>
          <dl className={styles.ownership}>
            <dd>
              Owner: <span className={styles["grey-value"]}>{study.owner_username}</span>
            </dd>
            <dd>
              Admins:
              {study.additional_study_admin_usernames.length > 0 && (
                <span className={styles["grey-value"]}>{study.additional_study_admin_usernames}</span>
              )}
            </dd>
            <dd>
              Data Controller:{" "}
              <span className={styles["grey-value"]}>{study.data_controller_organisation.toUpperCase()}</span>
            </dd>
          </dl>

          {feedback && (
            <Alert type={"warning"} className={styles["feedback-alert"]}>
              <h4>This study has been rejected and the following feedback has been provided:</h4>
              <p>{feedback}</p>
              <hr></hr>
              <small>
                <em>Please adjust as appropriate and request another review.</em>
              </small>
            </Alert>
          )}

          <h3>Additional Information</h3>
          <hr />
          <dl className={styles.grouping}>
            <h4>Sponsorships & Approvals</h4>
            {study.involves_ucl_sponsorship && (
              <dd className={`${styles.badge} ${styles["badge-no-risk-associated"]}`}>UCL Sponsorship</dd>
            )}
            {study.involves_cag && (
              <dd className={`${styles.badge} ${styles["badge-risk-associated"]}`}>
                CAG approval
                <InfoTooltip text="increases risk score by 5" />
              </dd>
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
              <dd className={`${styles.badge} ${styles["badge-risk-associated"]}`}>
                NHS England involvement
                <InfoTooltip text={standardRiskScoreStatement} />
              </dd>
            )}
            {study.involves_mnca && (
              <dd className={`${styles.badge} ${styles["badge-no-risk-associated"]}`}>involves MNCA</dd>
            )}
            {study.requires_dspt && (
              <dd className={`${styles.badge} ${styles["badge-risk-associated"]}`}>
                requires DSPT
                <InfoTooltip text={standardRiskScoreStatement} />
              </dd>
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
              <dd className={`${styles.badge} ${styles["badge-risk-associated"]}`}>
                requires DBS
                <InfoTooltip text={standardRiskScoreStatement} />
              </dd>
            )}
            {study.is_data_protection_office_registered && (
              <dd className={`${styles.badge} ${styles["badge-no-risk-associated"]}`}>is registered with DPO</dd>
            )}
            {study.involves_third_party && (
              <dd className={`${styles.badge} ${styles["badge-risk-associated"]}`}>
                third party
                <InfoTooltip text="increases risk score by 5 if no mNCA" />
              </dd>
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
              <dd className={`${styles.badge} ${styles["badge-risk-associated"]}`}>
                data processing outside EEA
                <InfoTooltip text="increases risk score by 10" />
              </dd>
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

      {/* Admin actions */}

      {isAdmin && (
        <AdminFeedbackSection
          status={study.approval_status}
          feedback={feedback}
          setFeedback={setFeedback}
          handleUpdateStudyStatus={handleUpdateStudyStatus}
        />
      )}
    </>
  );
}

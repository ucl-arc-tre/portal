import { Study, ApprovalStatus } from "@/openapi";
import Box from "../ui/Box";
import { Alert, formatDate } from "../shared/exports";
import StatusBadge from "../ui/StatusBadge";
import styles from "./StudyDetails.module.css";
import Button from "../ui/Button";
import InfoTooltip from "../ui/InfoTooltip";
import Loading from "../ui/Loading";

type StudyOverviewProps = {
  study: Study;
  isIGOpsStaff: boolean;
  isStudyOwner: boolean;
  isStudyAdmin: boolean;
  setStudyFormOpen?: (name: boolean) => void;
  studyStepsCompleted?: boolean;
  riskScore: number;
  riskScoreLoading: boolean;
  approvalStatus: ApprovalStatus | undefined;
  handleUpdateStudyStatus: (status: ApprovalStatus) => void;
  feedback?: string;
  numAssets: number;
  numContracts: number;
};

export default function StudyOverview(props: StudyOverviewProps) {
  const {
    study,
    isIGOpsStaff,
    isStudyOwner,
    isStudyAdmin,
    setStudyFormOpen,
    studyStepsCompleted,
    approvalStatus,
    riskScore,
    riskScoreLoading,
    handleUpdateStudyStatus,
    feedback,
    numAssets,
    numContracts,
  } = props;

  const isStudyOwnerOrAdmin = isStudyOwner || isStudyAdmin;

  const standardRiskScoreStatement = "increases risk score by 5";
  return (
    <>
      {isStudyOwnerOrAdmin && setStudyFormOpen && (
        <div className={styles["study-actions"]}>
          <Button variant="secondary" size="small" onClick={() => setStudyFormOpen(true)} data-cy="edit-study-button">
            {study.feedback ? "Respond to Feedback" : "Edit Study"}
          </Button>

          {studyStepsCompleted &&
            approvalStatus !== "Approved" &&
            (approvalStatus !== "Pending" ? (
              <Button
                onClick={() => handleUpdateStudyStatus("Pending")}
                size="small"
                data-cy="study-ready-for-review-button"
              >
                Mark Ready for Review
              </Button>
            ) : (
              <Button disabled size="small">
                Submitted for Review
              </Button>
            ))}
        </div>
      )}

      <Box>
        <div className={styles["pre-description"]}>
          <span>
            Last updated: <span className={styles["grey-value"]}>{formatDate(study.updated_at)}</span>
          </span>
          <span>
            Risk Score:{" "}
            <span className={styles["risk-score"]}>{riskScoreLoading ? <Loading message={null} /> : riskScore}</span>
          </span>
          <StatusBadge status={approvalStatus} isOpsStaff={isIGOpsStaff} type="study" />{" "}
        </div>
        <h3 className={styles.description}>{study.description}</h3>
        <div>
          <dl className={styles.ownership}>
            <dd>
              Owner: <span className={styles["grey-value"]}>{study.owner_username}</span>
            </dd>
            <dd>
              Admins:
              {study.additional_study_admin_usernames.map((username) => (
                <li key={username}>
                  <span className={styles["grey-value"]}>{username}</span>
                </li>
              ))}
            </dd>
            <dd>
              Data Controller:{" "}
              <span className={styles["grey-value"]}>{study.data_controller_organisation.toUpperCase()}</span>
            </dd>
          </dl>

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

          {feedback && (
            <Alert type={approvalStatus === "Approved" ? "info" : "warning"} className={styles["feedback-alert"]}>
              <h4>This study has been given the following feedback:</h4>
              <p>{feedback}</p>
              {approvalStatus !== "Approved" && (
                <>
                  <hr></hr>
                  <small>
                    <em>Please adjust as appropriate and request another review.</em>
                  </small>
                </>
              )}
            </Alert>
          )}

          {/*//TODO: add summary of num of projects*/}

          <div>
            <h4>Summary of related entities:</h4>
            <dl className={styles.grouping}>
              <dd>
                Assets: <span className={styles["grey-value"]}>{numAssets}</span>
              </dd>
              <dd>
                Contracts: <span className={styles["grey-value"]}>{numContracts}</span>
              </dd>
            </dl>
          </div>
        </div>
      </Box>
    </>
  );
}

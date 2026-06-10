import { Study } from "@/openapi";
import { Alert } from "../../shared/uikitExports";
import StatusBadge from "../../ui/StatusBadge";
import styles from "./StudyDetails.module.css";
import InfoTooltip from "../../ui/InfoTooltip";
import { formatDate } from "../../shared/exports";
import Badge from "@/components/ui/Badge";

type StudyOverviewProps = {
  study: Study;
  riskScore: number;
};

function getRiskClassification(score: number): string {
  if (score < 10) {
    return "low";
  } else if (score >= 10 && score < 20) {
    return "moderate";
  } else if (score >= 20 && score < 50) {
    return "high";
  } else if (score > 50) {
    return "very-high";
  }
  return "default";
}

export default function StudyDetails(props: StudyOverviewProps) {
  const { study, riskScore } = props;
  const standardRiskScoreStatement = "increases risk score by 5";

  const greyValueClass = `${styles["value"]} ${styles["grey"]}`;
  const riskClassification = getRiskClassification(riskScore);
  const riskScoreStyle = styles[`risk-score-${riskClassification}`];

  return (
    <>
      <div className={styles["pre-description"]} data-cy="study-details">
        <span className={styles["detail-item"]}>
          Case ref: <span className={greyValueClass}>{String(study.caseref).padStart(5, "0")}</span>
        </span>

        <span className={styles["detail-item"]}>
          Created: <span className={greyValueClass}>{formatDate(study.created_at)}</span>
        </span>

        <span className={styles["detail-item"]}>
          Last updated: <span className={greyValueClass}>{formatDate(study.updated_at)}</span>
        </span>

        {study.last_signoff && (
          <span className={styles["detail-item"]}>
            Last signed off: <span className={greyValueClass}>{formatDate(study.last_signoff)}</span>
          </span>
        )}

        <span className={styles["detail-item"]}>
          Risk:{" "}
          <Badge className={`${riskScoreStyle}`} cy="risk-badge">
            {riskClassification} ({riskScore})
          </Badge>
        </span>

        <span className={styles["detail-item"]}>
          Status: <StatusBadge status={study.approval_status} type="study" />
        </span>
      </div>

      <h3 className={styles.description}>{study.description}</h3>

      <div>
        <dl className={styles.ownership}>
          <dd>
            Owner: <span className={greyValueClass}>{study.owner_username}</span>
          </dd>

          <dd className={styles["detail-item"]}>
            Admins:
            {study.additional_study_admin_usernames.map((username) => (
              <li key={username}>
                <span className={greyValueClass}>{username}</span>
              </li>
            ))}
          </dd>

          <dd className={styles["detail-item"]}>
            Data Controller:
            <span className={greyValueClass}>{study.data_controller_organisation.toUpperCase()}</span>
          </dd>
        </dl>

        <h3>Additional Information</h3>
        <hr />
        <dl className={styles.grouping}>
          <dt>Sponsorships & Approvals</dt>
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
                <em>No sponsorship or approval information given</em>
              </dd>
            )}
        </dl>

        <dl className={styles.grouping}>
          <dt>NHS</dt>
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

          {!study.is_nhs_associated && !study.involves_nhs_england && !study.involves_mnca && !study.requires_dspt && (
            <dd>
              <em> No NHS information given</em>
            </dd>
          )}
        </dl>
        <dl className={styles.grouping}>
          <dt>Data</dt>

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

        {study.feedback && (
          <Alert type={study.approval_status === "Approved" ? "info" : "warning"} className={styles["feedback-alert"]}>
            <h4>This study has been given the following feedback:</h4>
            <p>{study.feedback}</p>

            {study.approval_status !== "Approved" && (
              <>
                <hr></hr>
                <small>
                  <em>Please adjust as appropriate and request another review.</em>
                </small>
              </>
            )}
          </Alert>
        )}
      </div>
    </>
  );
}

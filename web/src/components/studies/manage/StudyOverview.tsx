import { patchStudiesByStudyIdPending, Study, Asset, Contract, Project, StudyFeedbackEntry } from "@/openapi";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import { useAuth } from "@/hooks/useAuth";
import Error from "../../ui/Error";
import { Alert, AlertMessage } from "../../shared/uikitExports";
import { useState } from "react";
import styles from "./StudyDetails.module.css";
import Button from "../../ui/Button";

import StudyDetails from "./StudyDetails";
import StudyForm from "../study-form/StudyForm";
import Box from "@/components/ui/Box";
import Dialog from "@/components/ui/Dialog";
import StudyAffirmation from "./StudyAffirmation";
import StudyOwnerEdit from "./StudyOwnerEdit";
import StudyFeedback from "./StudyFeedback";
import StudyFeedbackHistory from "./StudyFeedbackHistory";
import { getStudyRiskLevel } from "../../../lib/riskScoreCalculations";

type StudyOverviewProps = {
  study: Study;
  assets?: Asset[];
  contracts?: Contract[];
  projects?: Project[];
  fetchStudy: (id: string) => Promise<void>;
  unagreedAdminUsernames?: string[];
  feedbackHistory?: StudyFeedbackEntry[];
};

export default function StudyOverview({
  study,
  assets,
  projects,
  contracts,
  fetchStudy,
  unagreedAdminUsernames,
  feedbackHistory = [],
}: StudyOverviewProps) {
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [affirmationDialogOpen, setAffirmationDialogOpen] = useState(false);
  const [studyOwnerEditModalOpen, setStudyOwnerEditModalOpen] = useState(false);

  const { userData, isIGStaff, isIGAdmin, isIAO, isAdmin } = useAuth();
  const isStudyOwner = (isIAO && study.owner_username === userData?.username) || false;
  const isStudyAdmin = (!!userData && study.additional_study_admin_usernames.includes(userData.username)) || false;
  const isStudyOwnerOrAdmin = isStudyOwner || isStudyAdmin;

  const studyOwnerPendingChange = study.pending_new_owner_username !== undefined;
  const canEditStudyOwner =
    (isStudyOwner || isIGStaff) && !studyOwnerPendingChange && study.approval_status !== "Incomplete";
  const canRequestReview = study.approval_status !== "Approved" && study.approval_status !== "Pending" && isStudyOwner;
  const hasUnagreedAdmins = unagreedAdminUsernames && unagreedAdminUsernames.length > 0;
  const canEditStudy = isStudyOwnerOrAdmin || isIGAdmin || isAdmin;
  const requiresDPORegistration = assets?.some(
    (asset) => asset.data_types?.includes("personal") || asset.data_types?.includes("special_category_personal")
  );

  const riskLevel = getStudyRiskLevel(assets);

  const onEditComplete = () => {
    setIsFormOpen(false);
    fetchStudy(study.id);
  };

  const handleMarkReadyForReview = async () => {
    setError(null);
    setIsSubmittingReview(true);
    const response = await patchStudiesByStudyIdPending({ path: { studyId: study.id } });
    if (responseIsError(response)) {
      setError(`Failed to update study status: ${extractErrorMessage(response)}`);
    } else {
      await fetchStudy(study.id);
    }
    setIsSubmittingReview(false);
    setAffirmationDialogOpen(false);
  };

  const assetsRequiringContracts =
    assets?.filter((asset) => asset.requires_contract && asset.contract_ids.length === 0) ?? [];

  return (
    <Box>
      <StudyFeedback feedbackHistory={feedbackHistory} approvalStatus={study.approval_status} />

      {isFormOpen && userData && (
        <StudyForm
          username={userData.username}
          setIsFormOpen={setIsFormOpen}
          editingStudy={study}
          onComplete={onEditComplete}
        />
      )}

      {error && <Error message={error} />}

      {hasUnagreedAdmins && isStudyOwnerOrAdmin && (
        <Alert type="warning" className={styles["sutdy-admin-review"]}>
          <AlertMessage>
            The following administrators have not yet agreed to the study agreement:{" "}
            {unagreedAdminUsernames.map((username, index) => (
              <span key={username}>
                <strong>{username}</strong>
                {index < unagreedAdminUsernames.length - 1 ? ", " : ""}
              </span>
            ))}
            . The study cannot be submitted for review until all administrators have agreed. Please inform all admins to
            log into the portal to sign the agreement.
          </AlertMessage>
        </Alert>
      )}

      {requiresDPORegistration && !study.is_data_protection_office_registered && (
        <Alert type="warning" className={styles["dpo-registration-warning"]}>
          <AlertMessage>
            At least one of the assets in this study contains personal data but the study does not have a Data
            Protection Office (DPO) number registered. Please register with the DPO and add the registration number to
            the study.
          </AlertMessage>
        </Alert>
      )}

      {canRequestReview && (
        <Alert type="info" className={styles["mark-ready-for-review-hint"]}>
          <AlertMessage>
            {
              "Once you have added all assets and contracts please mark the study as 'Ready for Review'. The Information Governance (IG) team will then review and provide feedback."
            }
          </AlertMessage>
        </Alert>
      )}

      <div className={styles["header"]}>
        <h2>{study.title}</h2>
        <div className={styles["buttons"]}>
          <StudyFeedbackHistory feedbackHistory={feedbackHistory} />

          {canEditStudy && (
            <Button variant="secondary" size="small" onClick={() => setIsFormOpen(true)} data-cy="edit-study-button">
              Edit Study
            </Button>
          )}

          {canRequestReview && (
            <Button
              onClick={() => setAffirmationDialogOpen(true)}
              disabled={isSubmittingReview || hasUnagreedAdmins}
              size="small"
              data-cy="study-ready-for-review-button"
            >
              {isSubmittingReview ? "Submitting..." : "Mark Ready for Review"}
            </Button>
          )}

          {study.approval_status === "Pending" && (
            <Button disabled size="small">
              Submitted for Review
            </Button>
          )}
        </div>
      </div>

      <StudyDetails
        study={study}
        riskLevel={riskLevel}
        canEditOwner={canEditStudyOwner}
        setOwnerEditModal={canEditStudyOwner ? setStudyOwnerEditModalOpen : undefined}
      />

      <div className={styles["pre-description"]} data-cy="study-summary-counts">
        <span className={styles["detail-item"]}>
          Projects: <span className={styles["grey-value"]}>{projects?.length ?? 0}</span>
        </span>
        <span className={styles["detail-item"]}>
          Assets: <span className={styles["grey-value"]}>{assets?.length ?? 0}</span>
        </span>
        <span className={styles["detail-item"]}>
          Contracts: <span className={styles["grey-value"]}>{contracts?.length ?? 0}</span>
        </span>
      </div>

      {studyOwnerEditModalOpen && (
        <StudyOwnerEdit
          study={study}
          setDialogOpen={(show) => {
            setStudyOwnerEditModalOpen(show);
            fetchStudy(study.id);
          }}
        />
      )}

      {affirmationDialogOpen && (
        <Dialog setDialogOpen={setAffirmationDialogOpen}>
          {assetsRequiringContracts.length > 0 && (
            <Alert type="warning" className={styles.outstanding}>
              <AlertMessage>
                Please note the following assets do not have an associated contract but have been flagged as requiring a
                contract:{" "}
                {assetsRequiringContracts.map((asset) => (
                  <li key={asset.id}>
                    <strong>{asset.title}</strong>
                  </li>
                ))}
              </AlertMessage>
            </Alert>
          )}

          <StudyAffirmation studyId={study.id} successCallback={handleMarkReadyForReview} />
        </Dialog>
      )}
    </Box>
  );
}

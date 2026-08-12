import { patchStudiesByStudyIdPending, Study, Asset } from "@/openapi";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import { useAuth } from "@/hooks/useAuth";
import Error from "../../ui/Error";
import { Alert, AlertMessage } from "../../shared/uikitExports";
import { useState } from "react";
import styles from "./StudyDetails.module.css";
import Button from "../../ui/Button";
import { storageLocationDefinitions } from "../../shared/storageDefinitions";

import StudyDetails from "./StudyDetails";
import StudyForm from "../study-form/StudyForm";
import Box from "@/components/ui/Box";
import Dialog from "@/components/ui/Dialog";
import StudyAffirmation from "./StudyAffirmation";
import StudyOwnerEdit from "./StudyOwnerEdit";

type StudyOverviewProps = {
  study: Study;
  assets?: Asset[];
  fetchStudy: (id: string) => Promise<void>;
  unagreedAdminUsernames?: string[];
};

export const calculateRiskScorePerAsset = (asset: Asset) => {
  let likelihoodScore = 0;
  let impactScore = 0;

  asset.locations.forEach((assetLocation) => {
    const location = storageLocationDefinitions.find((def) => def.value === assetLocation);
    if (!location) return;
    if (location.riskScore > likelihoodScore) {
      likelihoodScore = location.riskScore;
    }
  });

  if (asset.stored_outside_uk_eea === true) {
    likelihoodScore += 1;
    // to align with IG likelihood scale
    if (likelihoodScore > 3) likelihoodScore = 6;
  }

  switch (asset.classification_impact) {
    case "public":
      impactScore += 0;
      break;
    case "confidential":
    case "highly_confidential":
      impactScore += 1;
      break;
    default:
      break;
  }
  switch (asset.protection) {
    case "anonymisation":
      impactScore += 0;
      break;
    case "pseudonymisation":
      impactScore += 1;
      break;
    case "identifiable_low_confidence_pseudonymisation":
      impactScore += 2;
      break;
    default:
      break;
  }

  const assetScore = likelihoodScore * impactScore;

  return assetScore;
};

const calculateHighestAssetRiskScore = (assets: Asset[]) => {
  let highestAssetScore = 0;

  for (const asset of assets) {
    const assetScore = calculateRiskScorePerAsset(asset);
    if (assetScore > highestAssetScore) {
      highestAssetScore = assetScore;
    }
  }

  return highestAssetScore;
};

const calculateRiskScore = (study: Study, assets: Asset[] | undefined) => {
  if (assets === undefined || assets.length === 0) return undefined;
  return calculateHighestAssetRiskScore(assets);
};

export default function StudyOverview({ study, assets, fetchStudy, unagreedAdminUsernames }: StudyOverviewProps) {
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [affirmationDialogOpen, setAffirmationDialogOpen] = useState(false);
  const [studyOwnerEditModalOpen, setStudyOwnerEditModalOpen] = useState(false);

  const { userData, isIGStaff } = useAuth();
  const isIGAdmin = userData?.roles.includes("ig-admin") || false;
  const isStudyOwner =
    (userData?.roles.includes("information-asset-owner") && study.owner_username === userData?.username) || false;
  const isStudyAdmin = (!!userData && study.additional_study_admin_usernames.includes(userData.username)) || false;
  const isStudyOwnerOrAdmin = isStudyOwner || isStudyAdmin;

  const studyOwnerPendingChange = study.pending_new_owner_username !== undefined;
  const canEditStudyOwner =
    (isStudyOwner || isIGStaff) && !studyOwnerPendingChange && study.approval_status !== "Incomplete";
  const canRequestReview =
    study.approval_status !== "Approved" && study.approval_status !== "Pending" && isStudyOwner && !isIGStaff;
  const hasUnagreedAdmins = unagreedAdminUsernames && unagreedAdminUsernames.length > 0;
  const canEditStudy = isStudyOwnerOrAdmin || isIGAdmin;
  const requiresDPORegistration = assets?.some(
    (asset) => asset.data_types?.includes("personal") || asset.data_types?.includes("special_category_personal")
  );

  const riskScore = calculateRiskScore(study, assets);

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
        riskScore={riskScore}
        canEditOwner={canEditStudyOwner}
        setOwnerEditModal={canEditStudyOwner ? setStudyOwnerEditModalOpen : undefined}
      />

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

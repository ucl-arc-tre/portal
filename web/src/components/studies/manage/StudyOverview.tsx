import { patchStudiesByStudyIdPending, Study, Asset } from "@/openapi";
import { extractErrorMessage } from "@/lib/errorHandler";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertMessage } from "../../shared/uikitExports";
import { useState } from "react";
import styles from "./StudyDetails.module.css";
import Button from "../../ui/Button";
import { storageDefinitions } from "../../shared/storageDefinitions";

import StudyDetails from "./StudyDetails";
import StudyForm from "../study-form/StudyForm";

type StudyOverviewProps = {
  study: Study;
  assets: Asset[];
  fetchStudy: (id: string) => Promise<void>;
  unagreedAdminUsernames: string[];
};

const calculateAssetsRiskScore = (assets: Asset[], score: number, involvesNhsEngland: boolean | undefined | null) => {
  let assetsRiskScore = 0;
  const nhs_multiplier = 3;

  for (const asset of assets) {
    asset.locations.forEach((assetLocation) => {
      const location = storageDefinitions.find((def) => def.value === assetLocation);
      if (!location) return;
      assetsRiskScore += involvesNhsEngland
        ? asset.tier * nhs_multiplier * location.riskScore
        : asset.tier * location.riskScore;
    });
  }

  return score + assetsRiskScore;
};

const calculateBaseRiskScore = (study: Study) => {
  let score = 0;
  if (study.involves_data_processing_outside_eea) score += 10;
  if (study.requires_dbs) score += 5;
  if (study.requires_dspt) score += 5;
  if (study.involves_third_party && !study.involves_mnca) score += 5;
  if (study.involves_nhs_england || study.involves_cag) score += 5;
  return score;
};

const calculateRiskScore = (study: Study, assets: Asset[]) => {
  const baseRiskScore = calculateBaseRiskScore(study);
  if (!assets || assets.length === 0) return baseRiskScore;
  return calculateAssetsRiskScore(assets, baseRiskScore, study.involves_nhs_england);
};

export default function StudyOverview({ study, assets, fetchStudy, unagreedAdminUsernames }: StudyOverviewProps) {
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { userData } = useAuth();
  const isStudyOwner =
    (userData?.roles.includes("information-asset-owner") && study.owner_username === userData?.username) || false;
  const isStudyAdmin = (!!userData && study.additional_study_admin_usernames.includes(userData.username)) || false;
  const isStudyOwnerOrAdmin = isStudyOwner || isStudyAdmin;

  const canRequestReview =
    study.approval_status !== "Approved" && isStudyOwnerOrAdmin && !userData?.roles.includes("ig-ops-staff");
  const hasUnagreedAdmins = unagreedAdminUsernames.length > 0;

  const riskScore = calculateRiskScore(study, assets);

  const onEditComplete = () => {
    setIsFormOpen(false);
    fetchStudy(study.id);
  };

  const handleMarkReadyForReview = async () => {
    setError(null);
    setIsSubmittingReview(true);
    const response = await patchStudiesByStudyIdPending({ path: { studyId: study.id } });
    if (!response.response.ok) {
      setError(`Failed to update study status: ${extractErrorMessage(response)}`);
    } else {
      await fetchStudy(study.id);
    }
    setIsSubmittingReview(false);
  };

  return (
    <>
      {isFormOpen && userData && (
        <StudyForm
          username={userData.username}
          setIsFormOpen={setIsFormOpen}
          editingStudy={study}
          onComplete={onEditComplete}
        />
      )}

      {error && (
        <Alert type="error">
          <AlertMessage>{error}</AlertMessage>
        </Alert>
      )}

      {hasUnagreedAdmins && isStudyOwnerOrAdmin && (
        <Alert type="warning">
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

      {isStudyOwnerOrAdmin && (
        <div className={styles["study-actions"]}>
          <Button variant="secondary" size="small" onClick={() => setIsFormOpen(true)} data-cy="edit-study-button">
            Edit Study
          </Button>

          {canRequestReview && (
            <>
              {study.approval_status !== "Pending" ? (
                <Button
                  onClick={handleMarkReadyForReview}
                  disabled={isSubmittingReview || hasUnagreedAdmins}
                  size="small"
                  data-cy="study-ready-for-review-button"
                >
                  {isSubmittingReview ? "Submitting..." : "Mark Ready for Review"}
                </Button>
              ) : (
                <Button disabled size="small">
                  Submitted for Review
                </Button>
              )}
            </>
          )}
        </div>
      )}

      <StudyDetails study={study} riskScore={riskScore} />
    </>
  );
}

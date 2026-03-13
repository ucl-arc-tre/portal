import { postStudiesAdminByStudyIdReview, patchStudiesByStudyIdPending, Study, Asset, ApprovalStatus } from "@/openapi";
import { extractErrorMessage } from "@/lib/errorHandler";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertMessage } from "../../shared/uikitExports";
import { useEffect, useState } from "react";
import styles from "./StudyDetails.module.css";
import Button from "../../ui/Button";
import AdminFeedback from "./AdminFeedback";
import { storageDefinitions } from "../../shared/storageDefinitions";
import StudyOverview from "./StudyOverview";
import StudyForm from "../study-form/StudyForm";

type StudyDetailsProps = {
  study: Study;
  assets: Asset[];
  fetchStudy: (id: string) => Promise<void>;
};

const calculateAssetsRiskScore = (assets: Asset[], score: number, involvesNhsEngland: boolean | undefined | null) => {
  let assetsRiskScore = 0;

  for (const asset of assets) {
    let assetScore = 0;
    const NhsMultiplier = 3;

    asset.locations.forEach((loc) => {
      const location = storageDefinitions.find((def) => def.value === loc);
      if (!location) return;
      if (involvesNhsEngland) {
        assetScore += asset.tier * NhsMultiplier * location!.riskScore;
      } else {
        assetScore += asset.tier * location!.riskScore;
      }
    });

    assetsRiskScore += assetScore;
  }

  score += assetsRiskScore;
  return score;
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

const calculateRiskScore = async (study: Study, assets: Asset[]) => {
  const baseRiskScore = calculateBaseRiskScore(study);
  if (!assets || assets.length === 0) return baseRiskScore;
  return calculateAssetsRiskScore(assets, baseRiskScore, study.involves_nhs_england);
};

export default function StudyDetails({ study, assets, fetchStudy }: StudyDetailsProps) {
  const [riskScore, setRiskScore] = useState(0);
  const [riskScoreLoading, setRiskScoreLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { userData } = useAuth();
  const isStudyOwner =
    (userData?.roles.includes("information-asset-owner") && study.owner_username === userData?.username) || false;
  const isStudyAdmin = (!!userData && study.additional_study_admin_usernames.includes(userData.username)) || false;
  const isStudyOwnerOrAdmin = isStudyOwner || isStudyAdmin;
  const isIGOpsStaff = userData?.roles.includes("ig-ops-staff") || false;

  const canRequestReview = approvalStatus !== "Approved";

  const onEditComplete = () => {
    setIsFormOpen(false);
    fetchStudy(study.id);
  };

  const handleUpdateStudyStatus = async (status: string, feedbackContent?: string) => {
    const studyId = study.id;
    setError(null);

    if (status === "Approved") {
      const response = await postStudiesAdminByStudyIdReview({
        path: { studyId },
        body: { status: "Approved", feedback: feedbackContent },
      });
      if (!response.response.ok) {
        const errorMsg = extractErrorMessage(response);
        setError(`Failed to update study status: ${errorMsg}`);
        return response;
      }
      setApprovalStatus("Approved");
      if (feedbackContent) setFeedback(feedbackContent);
    } else if (status === "Rejected") {
      const response = await postStudiesAdminByStudyIdReview({
        path: { studyId },
        body: { status: "Rejected", feedback: feedbackContent },
      });
      if (!response.response.ok) {
        const errorMsg = extractErrorMessage(response);
        setError(`Failed to update study status: ${errorMsg}`);
        return response;
      }
      setApprovalStatus("Rejected");
      if (feedbackContent) setFeedback(feedbackContent);
    } else if (status === "Pending") {
      const response = await patchStudiesByStudyIdPending({
        path: { studyId },
      });
      if (!response.response.ok) {
        const errorMsg = extractErrorMessage(response);
        setError(`Failed to update study status: ${errorMsg}`);
        return response;
      }
      setApprovalStatus("Pending");
    }
  };

  useEffect(() => {
    const getRiskScore = async () => {
      setRiskScoreLoading(true);
      try {
        const score = await calculateRiskScore(study, assets);
        setRiskScore(score);
      } catch (err) {
        setError(`Failed to calculate risk score. ${err}`);
      } finally {
        setRiskScoreLoading(false);
      }
    };

    getRiskScore();
    setApprovalStatus(study.approval_status);
    if (study.feedback) setFeedback(study.feedback);
  }, [study, assets]);

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

      {(isStudyOwnerOrAdmin || canRequestReview) && (
        <div className={styles["study-actions"]}>
          {isStudyOwnerOrAdmin && (
            <Button variant="secondary" size="small" onClick={() => setIsFormOpen(true)} data-cy="edit-study-button">
              Edit Study
            </Button>
          )}

          {canRequestReview && (
            <>
              {approvalStatus !== "Pending" ? (
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
              )}
            </>
          )}
        </div>
      )}

      <StudyOverview
        study={study}
        riskScore={riskScore}
        riskScoreLoading={riskScoreLoading}
        approvalStatus={approvalStatus}
        feedback={feedback}
      />

      {isIGOpsStaff && (
        <AdminFeedback
          status={study.approval_status}
          feedbackFromStudy={feedback}
          handleUpdateStudyStatus={handleUpdateStudyStatus}
        />
      )}
    </>
  );
}

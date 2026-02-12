import {
  postStudiesAdminByStudyIdReview,
  patchStudiesByStudyIdPending,
  Study,
  Asset,
  getStudiesByStudyIdAssets,
  ApprovalStatus,
} from "@/openapi";
import { useEffect, useState } from "react";
import styles from "./StudyDetails.module.css";
import Button from "../ui/Button";
import AdminFeedbackSection from "./AdminFeedbackSection";
import { storageDefinitions } from "../shared/storageDefinitions";
import Assets from "../assets/Assets";
import StudyOverview from "./StudyOverview";
import ContractManagement from "../contracts/ContractManagement";

type StudyDetailsProps = {
  study: Study;
  isIGOpsStaff: boolean;
  isStudyOwner: boolean;
  isStudyAdmin: boolean;
  setStudyFormOpen?: (name: boolean) => void;
  studyStepsCompleted?: boolean;
};

const fetchAssets = async (studyId: string) => {
  const assetResponse = await getStudiesByStudyIdAssets({ path: { studyId } });
  if (assetResponse.response.ok && assetResponse.data) {
    if (assetResponse.data.length > 0) {
      return assetResponse.data;
    } else {
      return [];
    }
  }
};

const calculateAssetsRiskScore = (assets: Asset[], score: number, involvesNhsEngland: boolean | undefined | null) => {
  let assetsRiskScore = 0;

  for (const asset of assets) {
    // for each asset, loop through each location and calculate the score of that asset in that location
    // then sum these and repeat for all assets
    let assetScore = 0;
    const NhsMultiplier = 3;

    asset.locations.forEach((loc) => {
      // get location from storageDefinitions
      const location = storageDefinitions.find((def) => def.value === loc);

      if (!location) return;

      // do calculation based on whether it's nhs data
      // an asset in a different location counts as another asset
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

const calculateRiskScore = async (study: Study) => {
  const baseRiskScore = calculateBaseRiskScore(study);
  const assets = await fetchAssets(study.id);
  if (!assets || assets.length === 0) return baseRiskScore;
  return calculateAssetsRiskScore(assets, baseRiskScore, study.involves_nhs_england);
};
export default function StudyDetails(props: StudyDetailsProps) {
  const { study, isIGOpsStaff, isStudyOwner, isStudyAdmin, setStudyFormOpen, studyStepsCompleted } = props;
  const [riskScore, setRiskScore] = useState(0);
  const [riskScoreLoading, setRiskScoreLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus | undefined>(undefined);

  const [tab, setTab] = useState("overview");
  const [numAssets, setNumAssets] = useState(0);
  const [numContracts, setNumContracts] = useState(0);

  const isStudyOwnerOrAdmin = isStudyOwner || isStudyAdmin;

  const handleUpdateStudyStatus = async (status: string, feedbackContent?: string) => {
    const studyId = study.id;

    if (status === "Approved") {
      const response = await postStudiesAdminByStudyIdReview({
        path: { studyId },
        body: { status: "Approved", feedback: feedbackContent },
      });
      if (!response.response.ok) {
        console.error("Failed to update study status:", response.error);
        return response;
      } else {
        setApprovalStatus("Approved");
        if (feedbackContent) setFeedback(feedbackContent);
      }
    } else if (status === "Rejected") {
      const response = await postStudiesAdminByStudyIdReview({
        path: { studyId },
        body: { status: "Rejected", feedback: feedbackContent },
      });
      if (!response.response.ok) {
        console.error("Failed to update study status:", response.error);
        return response;
      } else {
        setApprovalStatus("Rejected");
        if (feedbackContent) setFeedback(feedbackContent);
      }
    } else if (status === "Pending") {
      const response = await patchStudiesByStudyIdPending({
        path: { studyId },
      });
      if (!response.response.ok) {
        console.error("Failed to update study status:", response.error);
        return response;
      } else {
        setApprovalStatus("Pending");
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
    const getRiskScore = async () => {
      setRiskScoreLoading(true);
      try {
        const score = await calculateRiskScore(study);
        setRiskScore(score);
      } catch (error) {
        console.error("Failed to calculate risk score:", error);
      } finally {
        setRiskScoreLoading(false);
      }
    };

    getRiskScore();

    setApprovalStatus(study.approval_status);
    if (study.feedback) setFeedback(study.feedback);
  }, [study]);

  return (
    <>
      <div className={"tab-collection"}>
        <Button
          onClick={() => setTab("overview")}
          variant="secondary"
          className={`tab ${tab === "overview" ? "active" : ""}`}
        >
          Overview
        </Button>
        <Button
          onClick={() => setTab("assets")}
          variant="secondary"
          className={`tab ${tab === "assets" ? "active" : ""}`}
        >
          Assets
        </Button>
        <Button
          onClick={() => setTab("contracts")}
          variant="secondary"
          className={`tab ${tab === "contracts" ? "active" : ""}`}
        >
          Contracts
        </Button>
        {/* TODO: add projects */}
      </div>

      <div className={`${styles["tab-content"]} ${tab === "overview" ? styles.active : ""}`}>
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

        <StudyOverview
          study={study}
          riskScore={riskScore}
          riskScoreLoading={riskScoreLoading}
          handleUpdateStudyStatus={handleUpdateStudyStatus}
          approvalStatus={approvalStatus}
          isIGOpsStaff={isIGOpsStaff}
          isStudyOwner={isStudyOwner}
          isStudyAdmin={isStudyAdmin}
          feedback={feedback}
          numAssets={numAssets}
          numContracts={numContracts}
        />

        {isIGOpsStaff && (
          <AdminFeedbackSection
            status={study.approval_status}
            feedbackFromStudy={feedback}
            handleUpdateStudyStatus={handleUpdateStudyStatus}
          />
        )}
      </div>

      <div className={`${styles["tab-content"]} ${tab === "assets" ? styles.active : ""}`}>
        <Assets
          studyId={study.id}
          studyTitle={study.title}
          canModify={isStudyOwnerOrAdmin}
          setNumAssets={setNumAssets}
        />
      </div>

      <div className={`${styles["tab-content"]} ${tab === "contracts" ? styles.active : ""}`}>
        <ContractManagement study={study} canModify={isStudyOwner || isStudyAdmin} setNumContracts={setNumContracts} />
      </div>
    </>
  );
}

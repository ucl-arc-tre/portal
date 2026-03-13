import {
  postStudiesAdminByStudyIdReview,
  patchStudiesByStudyIdPending,
  Study,
  Asset,
  ApprovalStatus,
  Contract,
} from "@/openapi";
import { extractErrorMessage } from "@/lib/errorHandler";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertCircleIcon, AlertMessage } from "../../shared/uikitExports";
import { useEffect, useState } from "react";
import styles from "./StudyDetails.module.css";
import Button from "../../ui/Button";
import AdminFeedback from "./AdminFeedback";
import { storageDefinitions } from "../../shared/storageDefinitions";
import Assets from "../../assets/Assets";
import StudyOverview from "./StudyOverview";
import ContractManagement from "../../contracts/ContractManagement";
import { calculateExpiryUrgency } from "../../shared/exports";

type StudyDetailsProps = {
  study: Study;
  assets: Asset[];
  setAssets: (assets: Asset[]) => void;
  assetContractsCompleted: boolean;
  checkAssetManagementCompleted: (assets: Asset[]) => Promise<boolean>;
  contracts: Contract[];
  setAssetContractsCompleted: (completed: boolean) => void;
  fetchStudyContents: () => Promise<void>;
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

const calculateRiskScore = async (study: Study, assets: Asset[]) => {
  const baseRiskScore = calculateBaseRiskScore(study);
  if (!assets || assets.length === 0) return baseRiskScore;
  return calculateAssetsRiskScore(assets, baseRiskScore, study.involves_nhs_england);
};

export default function StudyDetails(props: StudyDetailsProps) {
  const {
    study,
    assets,
    setAssets,
    assetContractsCompleted,
    setAssetContractsCompleted,
    checkAssetManagementCompleted,
    fetchStudyContents,
    contracts,
  } = props;
  const [riskScore, setRiskScore] = useState(0);
  const [riskScoreLoading, setRiskScoreLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus | undefined>(undefined);
  const [tab, setTab] = useState("overview");
  const [assetsNeedAttention, setAssetsNeedAttention] = useState(false);
  const [contractsNeedAttention, setContractsNeedAttention] = useState(false);

  const { userData } = useAuth();
  const isStudyOwner =
    (userData?.roles.includes("information-asset-owner") && study.owner_username === userData.username) || false;
  const isStudyAdmin = (userData && study.additional_study_admin_usernames.includes(userData?.username)) || false;
  const isIGOpsStaff = userData?.roles.includes("ig-ops-staff") || false;

  const canRequestReview = approvalStatus !== "Approved";

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

    if (!assetContractsCompleted) setAssetsNeedAttention(true);

    if (contracts.length > 0) {
      const needsAttention = contracts.some((contract) => {
        const expiryUrgency = calculateExpiryUrgency(new Date(contract.expiry_date));
        return expiryUrgency && expiryUrgency.level !== "low";
      });
      setContractsNeedAttention(needsAttention);
    }
  }, [study, assetContractsCompleted, assets, contracts]);

  return (
    <>
      {error && (
        <Alert type="error">
          <AlertMessage>{error}</AlertMessage>
        </Alert>
      )}

      <div className={"tab-collection"}>
        <Button
          onClick={() => setTab("overview")}
          variant="secondary"
          className={`tab ${tab === "overview" ? "active" : ""}`}
        >
          Study Overview
        </Button>
        <Button
          onClick={() => setTab("assets")}
          variant="secondary"
          className={`tab ${tab === "assets" ? "active" : ""}`}
        >
          Assets {assetsNeedAttention && <AlertCircleIcon className={styles["needs-attention"]} />}
        </Button>
        <Button
          onClick={() => setTab("contracts")}
          variant="secondary"
          className={`tab ${tab === "contracts" ? "active" : ""}`}
        >
          Contracts {contractsNeedAttention && <AlertCircleIcon className={styles["needs-attention"]} />}
        </Button>
      </div>

      <div className={`${styles["tab-content"]} ${tab === "overview" ? styles.active : ""}`}>
        {canRequestReview && (
          <div className={styles["study-actions"]}>
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
      </div>

      <div className={`${styles["tab-content"]} ${tab === "assets" ? styles.active : ""}`}>
        {tab === "assets" && (
          <Assets
            study={study}
            assets={assets}
            setAssets={setAssets}
            setAssetContractsCompleted={setAssetContractsCompleted}
            setTab={setTab}
            checkAssetManagementCompleted={checkAssetManagementCompleted}
          />
        )}
      </div>

      <div className={`${styles["tab-content"]} ${tab === "contracts" ? styles.active : ""}`}>
        <ContractManagement
          study={study}
          contracts={contracts}
          canModify={isStudyOwner || isStudyAdmin}
          assetContractsCompleted={assetContractsCompleted}
          setContractsNeedAttention={setContractsNeedAttention}
          fetchStudyContents={fetchStudyContents}
        />
      </div>
    </>
  );
}

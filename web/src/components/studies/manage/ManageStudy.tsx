import { useCallback, useEffect, useState } from "react";
import {
  Asset,
  Contract,
  getStudiesByStudyIdAgreements,
  getStudiesByStudyIdAssets,
  getStudiesByStudyIdAssetsByAssetIdContracts,
  getStudiesByStudyIdContracts,
  Study,
} from "@/openapi";
import Button from "../../ui/Button";
import StudyDetails from "./StudyDetails";
import StudySetupSteps from "./StudySetupSteps";
import Assets from "../../assets/Assets";
import ContractManagement from "../../contracts/ContractManagement";
import { useAuth } from "@/hooks/useAuth";
import { extractErrorMessage } from "@/lib/errorHandler";
import { Alert, AlertCircleIcon, AlertMessage } from "../../shared/uikitExports";
import { calculateExpiryUrgency } from "../../shared/exports";

import styles from "./ManageStudy.module.css";

type ManageStudyProps = {
  study: Study;
  fetchStudy: (id: string) => Promise<void>;
};

export default function ManageStudy({ study, fetchStudy }: ManageStudyProps) {
  const [studyStepsCompleted, setStudyStepsCompleted] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetContractsCompleted, setAssetContractsCompleted] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState("overview");

  const { userData } = useAuth();
  const isStudyOwner =
    (userData?.roles.includes("information-asset-owner") && study.owner_username === userData.username) || false;
  const isStudyAdmin = (userData && study.additional_study_admin_usernames.includes(userData?.username)) || false;
  const isStudyOwnerOrAdmin = isStudyOwner || isStudyAdmin;
  const isIGOpsStaff = userData?.roles.includes("ig-ops-staff") || false;

  const assetsNeedAttention = !assetContractsCompleted;
  const contractsNeedAttention = contracts.some((contract) => {
    const urgency = calculateExpiryUrgency(new Date(contract.expiry_date));
    return urgency && urgency.level !== "low";
  });

  const checkAssetManagementCompleted = useCallback(
    async (assets: Asset[]) => {
      // for each asset, check if it requires a contract and if it does, that there is one

      const checkContractsForAsset = async (assetId: string): Promise<boolean> => {
        const response = await getStudiesByStudyIdAssetsByAssetIdContracts({
          path: { studyId: study.id, assetId: assetId },
        });

        if (!response.response.ok || !response.data) {
          const errorMsg = extractErrorMessage(response);
          throw new Error(`Failed to load contracts for asset: ${errorMsg}`);
        }
        return response.data.length > 0;
      };

      const assetsRequiringContracts = assets.filter((asset) => asset.requires_contract);
      const requiredContractChecks = assetsRequiringContracts.map((asset) => checkContractsForAsset(asset.id));
      const results = await Promise.all(requiredContractChecks);
      return results.every((hasContract) => hasContract);
    },
    [study.id]
  );

  const fetchStudyContents = useCallback(async () => {
    setIsLoading(true);

    try {
      const [assetsResponse, contractsResponse, agreementsResponse] = await Promise.all([
        getStudiesByStudyIdAssets({ path: { studyId: study.id } }),
        getStudiesByStudyIdContracts({ path: { studyId: study.id } }),
        getStudiesByStudyIdAgreements({ path: { studyId: study.id } }),
      ]);

      if (!assetsResponse.response.ok || !assetsResponse.data) {
        const errorMsg = extractErrorMessage(assetsResponse);
        setError(`Failed to load Information Assets: ${errorMsg}`);
        return;
      }
      setAssets(assetsResponse.data);
      if (assetsResponse.data.length > 0) {
        setAssetContractsCompleted(await checkAssetManagementCompleted(assetsResponse.data));
      }

      if (!contractsResponse.response.ok || !contractsResponse.data) {
        const errorMsg = extractErrorMessage(contractsResponse);
        setError(`Failed to load contracts: ${errorMsg}`);
        return;
      }
      setContracts(contractsResponse.data);

      if (agreementsResponse.response.ok && agreementsResponse.data) {
        const confirmedUsernames = agreementsResponse.data.usernames;
        const userHasSigned = userData?.username ? confirmedUsernames.includes(userData.username) : false;
        const allAdminsHaveSigned = study.additional_study_admin_usernames.every((username) =>
          confirmedUsernames.includes(username)
        );
        if (userHasSigned && allAdminsHaveSigned && assetsResponse.data.length > 0) {
          setStudyStepsCompleted(true);
        }
      }
    } catch (error) {
      console.error("Failed to get study data:", error);
      setError("Failed to load study details. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [study.id, study.additional_study_admin_usernames, checkAssetManagementCompleted, userData]);

  useEffect(() => {
    if (study.id) {
      fetchStudyContents();
    }
  }, [study.id, checkAssetManagementCompleted, fetchStudyContents]);

  const onStepsComplete = useCallback(() => setStudyStepsCompleted(true), []);

  if (!userData) return null;
  if (isLoading) return null;

  return (
    <>
      {error && (
        <Alert type="error">
          <AlertMessage>{error}</AlertMessage>
        </Alert>
      )}

      {!studyStepsCompleted && !isIGOpsStaff && (
        <StudySetupSteps
          study={study}
          assets={assets}
          setAssets={setAssets}
          setAssetContractsCompleted={setAssetContractsCompleted}
          checkAssetManagementCompleted={checkAssetManagementCompleted}
          onStepsComplete={onStepsComplete}
        />
      )}

      {(studyStepsCompleted || isIGOpsStaff) && (
        <>
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

          {tab === "overview" && <StudyDetails study={study} assets={assets} fetchStudy={fetchStudy} />}

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

          {tab === "contracts" && (
            <ContractManagement
              study={study}
              contracts={contracts}
              canModify={isStudyOwnerOrAdmin}
              assetContractsCompleted={assetContractsCompleted}
              fetchStudyContents={fetchStudyContents}
            />
          )}
        </>
      )}
    </>
  );
}

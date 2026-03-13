import { useCallback, useEffect, useState } from "react";
import {
  Asset,
  Contract,
  getStudiesByStudyIdAgreements,
  getStudiesByStudyIdAssets,
  getStudiesByStudyIdContracts,
  Study,
} from "@/openapi";
import StudyOverview from "./StudyOverview";
import StudySetupSteps from "./StudySetupSteps";
import StudyTabs from "./StudyTabs";
import Assets from "../../assets/Assets";
import ContractManagement from "../../contracts/ContractManagement";
import { useAuth } from "@/hooks/useAuth";
import { extractErrorMessage } from "@/lib/errorHandler";
import { Alert, AlertMessage } from "../../shared/uikitExports";
import { calculateExpiryUrgency } from "../../shared/exports";
import { checkAssetManagementCompleted } from "./lib/assetContracts";

type ManageStudyProps = {
  study: Study;
  fetchStudy: (id: string) => Promise<void>;
};

export default function ManageStudy({ study, fetchStudy }: ManageStudyProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studyStepsCompleted, setStudyStepsCompleted] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetContractsCompleted, setAssetContractsCompleted] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [tab, setTab] = useState("study");

  const { userData } = useAuth();
  const isStudyOwner =
    (userData?.roles.includes("information-asset-owner") && study.owner_username === userData.username) || false;
  const isStudyAdmin = (userData && study.additional_study_admin_usernames.includes(userData?.username)) || false;
  const isStudyOwnerOrAdmin = isStudyOwner || isStudyAdmin;
  const isIGOpsStaff = userData?.roles.includes("ig-ops-staff") || false;

  const contractsNeedAttention = contracts.some((contract) => {
    const urgency = calculateExpiryUrgency(new Date(contract.expiry_date));
    return urgency && urgency.level !== "low";
  });

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
        const assetContractsCompleted = await checkAssetManagementCompleted(assetsResponse.data, study.id);
        setAssetContractsCompleted(assetContractsCompleted);
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
          onStepsComplete={() => setStudyStepsCompleted(true)}
        />
      )}

      {(studyStepsCompleted || isIGOpsStaff) && (
        // todo: implement a router and set tabs via query strings
        <>
          <StudyTabs
            tab={tab}
            setTab={setTab}
            assetsNeedAttention={!assetContractsCompleted}
            contractsNeedAttention={contractsNeedAttention}
          />

          {tab === "study" && <StudyOverview study={study} assets={assets} fetchStudy={fetchStudy} />}

          {tab === "assets" && <Assets study={study} assets={assets} setAssets={setAssets} setTab={setTab} />}

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

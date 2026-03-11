import { useCallback, useEffect, useState } from "react";
import {
  Asset,
  Contract,
  getStudiesByStudyIdAssets,
  getStudiesByStudyIdAssetsByAssetIdContracts,
  getStudiesByStudyIdContracts,
  Study,
} from "@/openapi";
import StepProgress from "../ui/steps/StepProgress";
import StepArrow from "../ui/steps/StepArrow";
import StudyAgreement from "./StudyAgreement";
import Assets from "../assets/Assets";

import styles from "./ManageStudy.module.css";
import StudyDetails from "./StudyDetails";
import { useAuth } from "@/hooks/useAuth";
import StudyForm from "./StudyForm";
import StudyAdminsAgreements from "./StudyAdminsAgreements";
import { extractErrorMessage } from "@/lib/errorHandler";
import { calculateExpiryUrgency } from "../shared/exports";
import { Alert, AlertMessage } from "../shared/uikitExports";

type ManageStudyProps = {
  study: Study;
  fetchStudy: (id?: string) => Promise<void>;
};

export default function ManageStudy({ study, fetchStudy }: ManageStudyProps) {
  const [agreementCompleted, setAgreementCompleted] = useState(false);
  const [adminsAgreementsCompleted, setAdminsAgreementsCompleted] = useState(false);
  const [studyFormOpen, setStudyFormOpen] = useState(false);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [numAssets, setNumAssets] = useState<number | null>(null);
  const [hasAsset, setHasAsset] = useState(false);
  const [assetContractsCompleted, setAssetContractsCompleted] = useState(false);

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [numContracts, setNumContracts] = useState<number | null>(null);
  const [contractsNeedAttention, setContractsNeedAttention] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assetError, setAssetError] = useState<string | null>(null);
  const [contractError, setContractError] = useState<string | null>(null);

  const { userData } = useAuth();
  const isStudyOwner =
    (userData?.roles.includes("information-asset-owner") && study.owner_username === userData.username) || false;
  const isStudyAdmin = (userData && study.additional_study_admin_usernames.includes(userData?.username)) || false;
  const isStudyOwnerOrAdmin = isStudyOwner || isStudyAdmin;
  const isIGOpsStaff = userData?.roles.includes("ig-ops-staff") || false;

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
      const [assetsResponse, contractsResponse] = await Promise.all([
        getStudiesByStudyIdAssets({ path: { studyId: study.id } }),
        getStudiesByStudyIdContracts({ path: { studyId: study.id } }),
      ]);
      if (!assetsResponse.response.ok || !assetsResponse.data) {
        const errorMsg = extractErrorMessage(assetsResponse);
        setAssetError(`Failed to load Information Assets: ${errorMsg}`);
        return;
      }
      setAssets(assetsResponse.data);
      setNumAssets(assetsResponse.data.length);
      if (assetsResponse.data.length > 0) {
        setHasAsset(true);

        setAssetContractsCompleted(await checkAssetManagementCompleted(assetsResponse.data));
      } else {
        setHasAsset(false);
      }

      if (!contractsResponse.response.ok || !contractsResponse.data) {
        const errorMsg = extractErrorMessage(contractsResponse);
        setContractError(`Failed to load contracts: ${errorMsg}`);
        return;
      }
      setContracts(contractsResponse.data);
      setNumContracts(contractsResponse.data.length);
      if (contractsResponse.data.length > 0) {
        const needsAttention = contractsResponse.data.some((contract) => {
          const expiryUrgency = calculateExpiryUrgency(new Date(contract.expiry_date));
          return expiryUrgency && expiryUrgency.level !== "low";
        });
        setContractsNeedAttention(needsAttention);
      }
    } catch (error) {
      console.error("Failed to get profile data:", error);
      setError("Failed to load study details. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [study.id, checkAssetManagementCompleted]);

  useEffect(() => {
    if (study.id) {
      fetchStudyContents();
    }
  }, [study.id, checkAssetManagementCompleted, fetchStudyContents]);

  const studyStepsCompleted = agreementCompleted && adminsAgreementsCompleted && hasAsset;

  const studySteps: Step[] = [
    {
      id: "study-agreement",
      title: "Study Agreement",
      description: "Review and accept the study agreement terms.",
      completed: agreementCompleted,
      current: !agreementCompleted,
    },
    {
      id: "study-assets",
      title: "Information Assets",
      description:
        "Create and manage at least one information asset. You can create more assets at any time. Note that contracts can also be attached to assets, in some cases this is required.",
      completed: hasAsset,
      current: !hasAsset || !assetContractsCompleted,
    },
    {
      id: "study-agreements",
      title: "Study Agreements",
      description: "Ensure all administrators have agreed to the study agreement",
      completed: adminsAgreementsCompleted,
      current: hasAsset && !adminsAgreementsCompleted,
    },
  ];
  if (isLoading) return null;
  const getCurrentStepComponent = () => {
    if (!agreementCompleted) {
      return (
        <StudyAgreement
          studyId={study.id}
          studyTitle={study.title}
          agreementCompleted={agreementCompleted}
          setAgreementCompleted={setAgreementCompleted}
        />
      );
    }

    if (!hasAsset) {
      return (
        <>
          <Assets
            studyId={study.id}
            assets={assets}
            setAssets={setAssets}
            setAssetContractsCompleted={setAssetContractsCompleted}
            setHasAsset={setHasAsset}
            canModify={isStudyOwnerOrAdmin}
            setNumAssets={setNumAssets}
            checkAssetManagementCompleted={checkAssetManagementCompleted}
          />
        </>
      );
    }

    if (!adminsAgreementsCompleted) {
      return (
        <StudyAdminsAgreements
          studyId={study.id}
          studyAdminUsernames={study.additional_study_admin_usernames}
          completed={adminsAgreementsCompleted}
          setCompleted={setAdminsAgreementsCompleted}
        />
      );
    }
  };

  return (
    <>
      {studyFormOpen && userData && (
        <StudyForm
          username={userData.username}
          setStudyFormOpen={setStudyFormOpen}
          editingStudy={study}
          fetchStudyData={fetchStudy}
        />
      )}

      {error && (
        <Alert type="error">
          <AlertMessage>{error}</AlertMessage>
        </Alert>
      )}

      {!studyStepsCompleted && (
        <>
          <StudyDetails
            userData={userData}
            study={study}
            setStudyFormOpen={setStudyFormOpen}
            studyStepsCompleted={studyStepsCompleted}
            assets={assets}
            setAssets={setAssets}
            setHasAsset={setHasAsset}
            assetContractsCompleted={assetContractsCompleted}
            setAssetContractsCompleted={setAssetContractsCompleted}
            checkAssetManagementCompleted={checkAssetManagementCompleted}
            numAssets={numAssets}
            setNumAssets={setNumAssets}
            numContracts={numContracts}
            setNumContracts={setNumContracts}
            fetchStudyContents={fetchStudyContents}
            contracts={contracts}
          />
          <StepProgress
            steps={studySteps}
            isComplete={studyStepsCompleted}
            introText="Complete the following steps to set up your study."
            ariaLabel="Study setup progress"
          />

          <StepArrow />
        </>
      )}
      {getCurrentStepComponent()}

      {(studyStepsCompleted || isIGOpsStaff) && (
        <>
          <div className={styles["completed-section"]}>
            <StudyDetails
              userData={userData}
              study={study}
              setStudyFormOpen={setStudyFormOpen}
              studyStepsCompleted={studyStepsCompleted}
              assets={assets}
              setAssets={setAssets}
              setHasAsset={setHasAsset}
              assetContractsCompleted={assetContractsCompleted}
              setAssetContractsCompleted={setAssetContractsCompleted}
              checkAssetManagementCompleted={checkAssetManagementCompleted}
              numAssets={numAssets}
              setNumAssets={setNumAssets}
              numContracts={numContracts}
              setNumContracts={setNumContracts}
              fetchStudyContents={fetchStudyContents}
              contracts={contracts}
            />
          </div>
        </>
      )}
    </>
  );
}

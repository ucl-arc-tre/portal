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
import StudyForm from "../study-form/StudyForm";
import StudySetupSteps from "./StudySetupSteps";
import { useAuth } from "@/hooks/useAuth";
import { extractErrorMessage } from "@/lib/errorHandler";
import { Alert, AlertMessage } from "../../shared/uikitExports";

import styles from "./ManageStudy.module.css";

type ManageStudyProps = {
  study: Study;
  fetchStudy: (id: string) => Promise<void>;
};

export default function ManageStudy({ study, fetchStudy }: ManageStudyProps) {
  const [studyStepsCompleted, setStudyStepsCompleted] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetContractsCompleted, setAssetContractsCompleted] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const onComplete = () => {
    setIsFormOpen(false);
    fetchStudy(study.id);
  };

  const onStepsComplete = useCallback(() => setStudyStepsCompleted(true), []);

  if (isLoading) return null;

  return (
    <>
      {isFormOpen && userData && (
        <StudyForm
          username={userData.username}
          setIsFormOpen={setIsFormOpen}
          editingStudy={study}
          onComplete={onComplete}
        />
      )}

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
          {isStudyOwnerOrAdmin && (
            <div className={styles["study-actions"]}>
              <Button variant="secondary" size="small" onClick={() => setIsFormOpen(true)} data-cy="edit-study-button">
                Edit Study
              </Button>
            </div>
          )}

          <StudyDetails
            study={study}
            contracts={contracts}
            assets={assets}
            setAssets={setAssets}
            assetContractsCompleted={assetContractsCompleted}
            setAssetContractsCompleted={setAssetContractsCompleted}
            checkAssetManagementCompleted={checkAssetManagementCompleted}
            fetchStudyContents={fetchStudyContents}
          />
        </>
      )}
    </>
  );
}

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
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
import AdminReview from "./AdminReview";
import Assets from "../../assets/Assets";
import ContractManagement from "../../contracts/ContractManagement";
import { useAuth } from "@/hooks/useAuth";
import { extractErrorMessage } from "@/lib/errorHandler";
import { Alert, AlertMessage } from "../../shared/uikitExports";
import Loading from "../../ui/Loading";

type ManageStudyProps = {
  study: Study;
  fetchStudy: (id: string) => Promise<void>;
};

export default function ManageStudy({ study, fetchStudy }: ManageStudyProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [unagreedAdminUsernames, setUnagreedAdminUsernames] = useState<string[]>([]);
  const [studyStepsCompleted, setStudyStepsCompleted] = useState(false);

  const router = useRouter();
  const tab = (router.query.tab as string) ?? "study";

  const { userData } = useAuth();
  const isStudyOwner =
    (userData?.roles.includes("information-asset-owner") && study.owner_username === userData.username) || false;
  const isStudyAdmin = (userData && study.additional_study_admin_usernames.includes(userData?.username)) || false;
  const isStudyOwnerOrAdmin = isStudyOwner || isStudyAdmin;
  const isIGOpsStaff = userData?.roles.includes("ig-ops-staff") || false;

  const checkStudyAdminAgreements = useCallback(
    (studySignatures: string[]) => {
      const unagreedAdminUsernames = study.additional_study_admin_usernames.filter(
        (user) => !studySignatures.includes(user)
      );
      setUnagreedAdminUsernames(unagreedAdminUsernames);
    },
    [study.additional_study_admin_usernames]
  );

  const fetchStudyContents = useCallback(async () => {
    setError(null);
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

      if (!contractsResponse.response.ok || !contractsResponse.data) {
        const errorMsg = extractErrorMessage(contractsResponse);
        setError(`Failed to load contracts: ${errorMsg}`);
        return;
      }

      if (!agreementsResponse.response.ok || !agreementsResponse.data) {
        const errorMsg = extractErrorMessage(agreementsResponse);
        setError(`Failed to load agreements: ${errorMsg}`);
        return;
      }

      setAssets(assetsResponse.data);
      setContracts(contractsResponse.data);

      checkStudyAdminAgreements(agreementsResponse.data.usernames);
    } catch (error) {
      console.error("Failed to get study contents:", error);
      setError("Failed to load study contents. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [study.id, checkStudyAdminAgreements]);

  useEffect(() => {
    if (study.id) {
      fetchStudyContents();
    }
  }, [study.id, fetchStudyContents]);

  if (!userData) return null;
  if (isLoading) return <Loading message="Loading study..." />;

  if (error) {
    return (
      <Alert type="error">
        <AlertMessage>{error}</AlertMessage>
      </Alert>
    );
  }

  if (!studyStepsCompleted && !isIGOpsStaff) {
    return (
      <StudySetupSteps
        study={study}
        assets={assets}
        setAssets={setAssets}
        onStepsComplete={() => {
          setStudyStepsCompleted(true);
          fetchStudyContents();
        }}
      />
    );
  }

  return (
    <>
      <StudyTabs assets={assets} contracts={contracts} />

      {tab === "study" && (
        <StudyOverview
          study={study}
          assets={assets}
          fetchStudy={fetchStudy}
          unagreedAdminUsernames={unagreedAdminUsernames}
        />
      )}

      {tab === "assets" && <Assets study={study} assets={assets} setAssets={setAssets} />}

      {tab === "contracts" && (
        <ContractManagement
          study={study}
          contracts={contracts}
          canModify={isStudyOwnerOrAdmin}
          someAssetsRequireContracts={assets.some((asset) => asset.requires_contract)}
          fetchStudyContents={fetchStudyContents}
        />
      )}

      {isIGOpsStaff && study.approval_status !== "Incomplete" && (
        <AdminReview
          study={study}
          unagreedAdminUsernames={unagreedAdminUsernames}
          onReviewComplete={() => fetchStudy(study.id)}
        />
      )}
    </>
  );
}

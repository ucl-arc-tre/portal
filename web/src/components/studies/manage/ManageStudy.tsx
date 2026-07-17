import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Asset,
  Contract,
  getStudiesByStudyIdAgreements,
  getStudiesByStudyIdAssets,
  getStudiesByStudyIdContracts,
  Study,
  StudyAgreements,
} from "@/openapi";
import StudyOverview from "./StudyOverview";
import StudySetupSteps from "./StudySetupSteps";
import StudyTabs from "./StudyTabs";
import AdminReview from "./AdminReview";
import Assets from "../../assets/Assets";
import ContractManagement from "../../contracts/ContractManagement";
import { useAuth } from "@/hooks/useAuth";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import Error from "../../ui/Error";
import Loading from "../../ui/Loading";
import { studySignoffWarningRequired } from "../../shared/exports";
import StudyAffirmation from "./StudyAffirmation";

type ManageStudyProps = {
  study: Study;
  fetchStudy: (id: string) => Promise<void>;
};

export default function ManageStudy({ study, fetchStudy }: ManageStudyProps) {
  const { userData } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [agreements, setAgreements] = useState<StudyAgreements | null>(null);
  const [unagreedAdminUsernames, setUnagreedAdminUsernames] = useState<string[]>([]);

  const hasAsset = assets.length > 0;
  const hasAgreed = agreements && userData && agreements.usernames.includes(userData.username);
  const studyStepsCompleted = isLoading ? null : hasAsset && hasAgreed;

  const router = useRouter();
  const tab = (router.query.tab as "study" | "assets" | "contracts") ?? "study";

  const isIGOpsStaff = userData?.roles.includes("ig-ops-staff") || false;
  const isStudyOwner =
    userData?.roles.includes("information-asset-owner") && study.owner_username === userData?.username;

  const showSignoffWarning =
    isStudyOwner &&
    study.approval_status === "Approved" &&
    study.last_signoff != null &&
    studySignoffWarningRequired(study.last_signoff);

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

      if (responseIsError(assetsResponse) || !assetsResponse.data) {
        const errorMsg = extractErrorMessage(assetsResponse);
        setError(`Failed to load Information Assets: ${errorMsg}`);
        return;
      }

      if (responseIsError(contractsResponse) || !contractsResponse.data) {
        const errorMsg = extractErrorMessage(contractsResponse);
        setError(`Failed to load contracts: ${errorMsg}`);
        return;
      }

      if (responseIsError(agreementsResponse) || !agreementsResponse.data) {
        const errorMsg = extractErrorMessage(agreementsResponse);
        setError(`Failed to load agreements: ${errorMsg}`);
        return;
      }

      setAssets(assetsResponse.data);
      setContracts(contractsResponse.data);
      setAgreements(agreementsResponse.data);

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
    return <Error message={error} />;
  }

  if (studyStepsCompleted === false && !isIGOpsStaff) {
    return (
      <StudySetupSteps
        study={study}
        assets={assets}
        setAssets={setAssets}
        onStepsComplete={() => {
          fetchStudyContents();
        }}
      />
    );
  }

  return (
    <>
      {showSignoffWarning && (
        <StudyAffirmation studyId={study.id} successCallback={() => fetchStudy(study.id)} isReaffirmation />
      )}
      {isIGOpsStaff && study.approval_status !== "Incomplete" && (
        <AdminReview
          study={study}
          unagreedAdminUsernames={unagreedAdminUsernames}
          onReviewComplete={() => fetchStudy(study.id)}
        />
      )}
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
          someAssetsRequireContracts={assets.some((asset) => asset.requires_contract)}
          fetchStudyContents={fetchStudyContents}
        />
      )}
    </>
  );
}

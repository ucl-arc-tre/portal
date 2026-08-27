import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Asset,
  Contract,
  Project,
  getProjects,
  getStudiesByStudyIdAgreements,
  getStudiesByStudyIdAssets,
  getStudiesByStudyIdContracts,
  getStudiesByStudyIdFeedback,
  Study,
  StudyAgreements,
  StudyFeedbackEntry,
} from "@/openapi";
import StudyOverview from "./StudyOverview";
import StudySetupSteps from "./StudySetupSteps";
import StudyTabs from "./StudyTabs";
import AdminReview from "./AdminReview";
import Assets from "../../assets/Assets";
import ContractManagement from "../../contracts/ContractManagement";
import ProjectCardsList from "../../projects/ProjectCardsList";
import { useAuth } from "@/hooks/useAuth";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import Error from "../../ui/Error";
import Loading from "../../ui/Loading";
import { studySignoffWarningRequired } from "../../shared/exports";
import StudyAffirmation from "./StudyAffirmation";
import { Alert, AlertMessage } from "../../shared/uikitExports";

type ManageStudyProps = {
  study: Study;
  fetchStudy: (id: string) => Promise<void>;
};

export default function ManageStudy({ study, fetchStudy }: ManageStudyProps) {
  const { userData, isIGStaff, isIAO } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [agreements, setAgreements] = useState<StudyAgreements | null>(null);
  const [feedbackHistory, setFeedbackHistory] = useState<StudyFeedbackEntry[]>([]);

  const hasAsset = assets.length > 0;
  const hasAgreed = agreements && userData && agreements.usernames.includes(userData.username);
  const studyStepsCompleted = isLoading ? null : hasAsset && hasAgreed;

  const unagreedAdminUsernames = agreements
    ? study.additional_study_admin_usernames.filter((user) => !agreements.usernames.includes(user))
    : [];

  const router = useRouter();
  const tab = (router.query.tab as "study" | "projects" | "assets" | "contracts") ?? "study";

  const isOwnStudy = study.owner_username === userData?.username;
  const isStudyOwner = userData && isIAO && isOwnStudy;

  const showSignoffWarning =
    isStudyOwner &&
    study.approval_status === "Approved" &&
    study.last_signoff != null &&
    studySignoffWarningRequired(study.last_signoff);

  const fetchStudyContents = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const [assetsResponse, contractsResponse, agreementsResponse, projectsResponse, feedbackResponse] =
        await Promise.all([
          getStudiesByStudyIdAssets({ path: { studyId: study.id } }),
          getStudiesByStudyIdContracts({ path: { studyId: study.id } }),
          getStudiesByStudyIdAgreements({ path: { studyId: study.id } }),
          getProjects(),
          getStudiesByStudyIdFeedback({ path: { studyId: study.id } }),
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

      if (responseIsError(projectsResponse) || !projectsResponse.data) {
        const errorMsg = extractErrorMessage(projectsResponse);
        setError(`Failed to load projects: ${errorMsg}`);
        return;
      }

      if (responseIsError(feedbackResponse) || !feedbackResponse.data) {
        const errorMsg = extractErrorMessage(feedbackResponse);
        setError(`Failed to load feedback history: ${errorMsg}`);
        return;
      }

      setAssets(assetsResponse.data);
      setContracts(contractsResponse.data);
      setAgreements(agreementsResponse.data);
      setProjects(projectsResponse.data.filter((project) => project.study_id === study.id));
      setFeedbackHistory(feedbackResponse.data);
    } catch (error) {
      console.error("Failed to get study contents:", error);
      setError("Failed to load study contents. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (study.id) {
      fetchStudyContents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [study.id]);

  if (!userData) return null;
  if (isLoading) return <Loading message="Loading study..." />;

  if (error) {
    return <Error message={error} />;
  }

  if (studyStepsCompleted === false && (!isIGStaff || isOwnStudy)) {
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

      {isIGStaff && isOwnStudy && (study.approval_status === "Pending" || study.approval_status === "Rejected") && (
        <Alert type="info">
          <AlertMessage>
            You cannot approve your own study, please ask another member of the IG team to provide a review.
          </AlertMessage>
        </Alert>
      )}

      {isIGStaff && !isOwnStudy && study.approval_status !== "Incomplete" && (
        <AdminReview
          study={study}
          unagreedAdminUsernames={unagreedAdminUsernames}
          onReviewComplete={() => fetchStudy(study.id)}
          feedbackHistory={feedbackHistory}
        />
      )}

      <StudyTabs assets={assets} contracts={contracts} />

      {tab === "study" && (
        <StudyOverview
          study={study}
          assets={assets}
          contracts={contracts}
          projects={projects}
          fetchStudy={fetchStudy}
          unagreedAdminUsernames={unagreedAdminUsernames}
          feedbackHistory={feedbackHistory}
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

      {tab === "projects" && <ProjectCardsList projects={projects} />}
    </>
  );
}

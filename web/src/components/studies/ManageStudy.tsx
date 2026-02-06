import { useState } from "react";
import { Study } from "@/openapi";
import StepProgress from "../ui/steps/StepProgress";
import StepArrow from "../ui/steps/StepArrow";
import StudyAgreement from "./StudyAgreement";
import Assets from "../assets/Assets";

import styles from "./ManageStudy.module.css";
import StudyDetails from "./StudyDetails";
import { useAuth } from "@/hooks/useAuth";
import StudyForm from "./StudyForm";
import StudyAdminsAgreements from "./StudyAdminsAgreements";
import Button from "../ui/Button";
import ContractManagement from "../contracts/ContractManagement";

type ManageStudyProps = {
  study: Study;
  fetchStudy: (id?: string) => Promise<void>;
};

export default function ManageStudy({ study, fetchStudy }: ManageStudyProps) {
  const [agreementCompleted, setAgreementCompleted] = useState(false);
  const [assetManagementCompleted, setAssetManagementCompleted] = useState(false);
  const [adminsAgreementsCompleted, setAdminsAgreementsCompleted] = useState(false);
  const [studyFormOpen, setStudyFormOpen] = useState(false);

  const { userData } = useAuth();
  const isStudyOwner =
    (userData?.roles.includes("information-asset-owner") && study.owner_username === userData.username) || false;
  const isStudyAdmin = (userData && study.additional_study_admin_usernames.includes(userData?.username)) || false;
  const isStudyOwnerOrAdmin = isStudyOwner || isStudyAdmin;

  const studyStepsCompleted = agreementCompleted && assetManagementCompleted && adminsAgreementsCompleted;

  const [tab, setTab] = useState("overview");

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
      completed: assetManagementCompleted,
      current: agreementCompleted && !assetManagementCompleted,
    },
    {
      id: "study-agreements",
      title: "Study Agreements",
      description: "Ensure all administrators have agreed to the study agreement",
      completed: adminsAgreementsCompleted,
      current: assetManagementCompleted && !adminsAgreementsCompleted,
    },
  ];

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

    if (!assetManagementCompleted) {
      return (
        <>
          <Assets
            studyId={study.id}
            studyTitle={study.title}
            setAssetManagementCompleted={setAssetManagementCompleted}
            canModify={isStudyOwnerOrAdmin}
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

      {!studyStepsCompleted && (
        <>
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

      {studyStepsCompleted && (
        <>
          <div className={styles["completed-section"]}>
            <div className={styles["study-tabs"]}>
              <Button
                onClick={() => setTab("overview")}
                variant="secondary"
                className={`${styles.tab} ${styles["overview-tab"]} ${tab === "overview" ? styles.active : ""}`}
              >
                Overview
              </Button>
              <Button
                onClick={() => setTab("assets")}
                variant="secondary"
                className={`${styles.tab} ${styles["assets-tab"]} ${tab === "assets" ? styles.active : ""}`}
              >
                Assets
              </Button>
              <Button
                onClick={() => setTab("contracts")}
                variant="secondary"
                className={`${styles.tab} ${styles["contracts-tab"]} ${tab === "contracts" ? styles.active : ""}`}
              >
                Contracts
              </Button>
              {/* TODO: add projects */}
            </div>
            {tab === "overview" && (
              <StudyDetails
                studyStepsCompleted={studyStepsCompleted}
                study={study}
                isIGOpsStaff={false}
                isStudyOwner={isStudyOwner}
                isStudyAdmin={isStudyAdmin}
                setStudyFormOpen={setStudyFormOpen}
              />
              //TODO: add summary of num of assets, contracts & projects
            )}
            {tab === "assets" && <Assets studyId={study.id} studyTitle={study.title} canModify={isStudyOwnerOrAdmin} />}
            {tab === "contracts" && <ContractManagement study={study} canModify={isStudyOwner || isStudyAdmin} />}
          </div>
        </>
      )}
    </>
  );
}

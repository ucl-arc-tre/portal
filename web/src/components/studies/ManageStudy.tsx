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

  const studyStepsCompleted = agreementCompleted && assetManagementCompleted && adminsAgreementsCompleted;

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
            isStudyOwner={isStudyOwner}
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
      <StudyDetails
        studyStepsCompleted={studyStepsCompleted}
        study={study}
        isAdmin={false}
        isStudyOwner={isStudyOwner}
        setStudyFormOpen={setStudyFormOpen}
      />

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
            <Assets studyId={study.id} studyTitle={study.title} isStudyOwner={isStudyOwner} />
          </div>
        </>
      )}
    </>
  );
}

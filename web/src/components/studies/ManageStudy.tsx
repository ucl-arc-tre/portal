import { useState } from "react";
import { getStudiesByStudyId, Study } from "@/openapi";
import StepProgress from "../ui/steps/StepProgress";
import StepArrow from "../ui/steps/StepArrow";
import StudyAgreement from "./StudyAgreement";
import Assets from "../assets/Assets";

import styles from "./ManageStudy.module.css";
import StudyDetails from "./StudyDetails";
import { useAuth } from "@/hooks/useAuth";
import StudyForm from "./StudyForm";

type ManageStudyProps = {
  study: Study;
};

export default function ManageStudy({ study }: ManageStudyProps) {
  const [agreementCompleted, setAgreementCompleted] = useState(false);
  const [assetManagementCompleted, setAssetManagementCompleted] = useState(false);
  const [studyFormOpen, setStudyFormOpen] = useState(false);
  const [currentStudy, setCurrentStudy] = useState(study);

  const { userData } = useAuth();
  const isStudyOwner =
    (userData?.roles.includes("information-asset-owner") && currentStudy.owner_username === userData.username) || false;

  const studyStepsCompleted = agreementCompleted && assetManagementCompleted;

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
      title: "Study Assets",
      description: "Create and manage at least one study asset. You can create more assets at any time.",
      completed: assetManagementCompleted,
      current: agreementCompleted && !assetManagementCompleted,
    },
  ];

  const getCurrentStepComponent = () => {
    if (!agreementCompleted) {
      return (
        <StudyAgreement
          studyId={currentStudy.id}
          studyTitle={currentStudy.title}
          agreementCompleted={agreementCompleted}
          setAgreementCompleted={setAgreementCompleted}
        />
      );
    }

    if (!assetManagementCompleted) {
      return (
        <Assets
          studyId={currentStudy.id}
          studyTitle={currentStudy.title}
          setAssetManagementCompleted={setAssetManagementCompleted}
        />
      );
    }
  };

  const getStudy = async () => {
    const studyId = currentStudy.id;
    const response = await getStudiesByStudyId({ path: { studyId } });
    if (response.response.ok && response.data) {
      setCurrentStudy(response.data);
    }
  };

  return (
    <>
      {studyFormOpen && userData && (
        <StudyForm
          username={userData.username}
          setStudyFormOpen={setStudyFormOpen}
          editingStudy={currentStudy}
          fetchStudies={getStudy}
        />
      )}

      <StepProgress
        steps={studySteps}
        isComplete={studyStepsCompleted}
        completionTitle="Study Setup Complete!"
        completionSubtitle="You have successfully completed all study setup steps."
        completionButtonText="Go to studies"
        completionButtonHref="/studies"
        introText="Complete the following steps to set up your study."
        ariaLabel="Study setup progress"
      />

      {!studyStepsCompleted && <StepArrow />}

      {getCurrentStepComponent()}

      {studyStepsCompleted && (
        <>
          <StudyDetails
            study={currentStudy}
            isAdmin={false}
            isStudyOwner={isStudyOwner}
            setStudyFormOpen={setStudyFormOpen}
          />
          <div className={styles["completed-section"]}>
            <Assets studyId={currentStudy.id} studyTitle={currentStudy.title} />
          </div>
        </>
      )}
    </>
  );
}

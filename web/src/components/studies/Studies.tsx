import { useState } from "react";
import { postStudies, Study, StudyCreateRequest, Auth, ValidationError } from "@/openapi";
import StudySelection from "../studies/StudySelection";
import StudyForm, { StudyFormData } from "./StudyForm";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";

import styles from "./Studies.module.css";

type Props = {
  userData: Auth;
  studies: Study[];
  fetchStudies: () => void;
};

export default function Studies(props: Props) {
  const { userData, studies, fetchStudies } = props;
  const [StudyFormOpen, setStudyFormOpen] = useState(false);
  const [showUclStaffModal, setShowUclStaffModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // this should match the domain that is used for the entra ID users in the portal
  const domainName = process.env.NEXT_PUBLIC_DOMAIN_NAME || "@ucl.ac.uk";

  const handleCreateStudyClick = () => {
    if (!userData.roles.includes("approved-staff-researcher")) {
      setShowUclStaffModal(true);
      return;
    }
    setStudyFormOpen(true);
  };

  const handleStudySubmit = async (data: StudyFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Convert form data to StudyCreateRequest API format
      const studyData: StudyCreateRequest = {
        title: data.title,
        description: data.description ? data.description : undefined,
        data_controller_organisation: data.dataControllerOrganisation.toLowerCase(),
        additional_study_admin_usernames: data.additionalStudyAdminUsernames
          .map((admin) => admin.value.trim())
          .map((username) => `${username}${domainName}`),
        involves_ucl_sponsorship: data.involvesUclSponsorship ? data.involvesUclSponsorship : undefined,
        involves_cag: data.involvesCag ? data.involvesCag : undefined,
        cag_reference: data.cagReference ? data.cagReference.toString() : undefined,
        involves_ethics_approval: data.involvesEthicsApproval ? data.involvesEthicsApproval : undefined,
        involves_hra_approval: data.involvesHraApproval ? data.involvesHraApproval : undefined,
        iras_id: data.irasId ? data.irasId : undefined,
        is_nhs_associated: data.isNhsAssociated ? data.isNhsAssociated : undefined,
        involves_nhs_england: data.involvesNhsEngland ? data.involvesNhsEngland : undefined,
        nhs_england_reference: data.nhsEnglandReference ? data.nhsEnglandReference.toString() : undefined,
        involves_mnca: data.involvesMnca ? data.involvesMnca : undefined,
        requires_dspt: data.requiresDspt ? data.requiresDspt : undefined,
        requires_dbs: data.requiresDbs ? data.requiresDbs : undefined,
        is_data_protection_office_registered: data.isDataProtectionOfficeRegistered
          ? data.isDataProtectionOfficeRegistered
          : undefined,
        data_protection_number:
          data.dataProtectionPrefix && data.dataProtectionDate && data.dataProtectionId
            ? `${data.dataProtectionPrefix}/${data.dataProtectionDate}/${data.dataProtectionId}`
            : undefined,
        involves_third_party: data.involvesThirdParty ? data.involvesThirdParty : undefined,
        involves_external_users: data.involvesExternalUsers ? data.involvesExternalUsers : undefined,
        involves_participant_consent: data.involvesParticipantConsent ? data.involvesParticipantConsent : undefined,
        involves_indirect_data_collection: data.involvesIndirectDataCollection
          ? data.involvesIndirectDataCollection
          : undefined,
        involves_data_processing_outside_eea: data.involvesDataProcessingOutsideEea
          ? data.involvesDataProcessingOutsideEea
          : undefined,
      };

      const response = await postStudies({
        body: studyData,
      });

      if (response.data) {
        setStudyFormOpen(false);
        fetchStudies();
        return;
      }

      if (response.error) {
        const errorData = response.error as ValidationError;
        if (errorData?.error_message) {
          setSubmitError(errorData.error_message);
          return;
        }
      }

      setSubmitError("An unknown error occurred.");
    } catch (error) {
      console.error("Failed to create study:", error);
      setSubmitError("Failed to create study. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {StudyFormOpen && (
        <StudyForm
          username={userData.username}
          setStudyFormOpen={setStudyFormOpen}
          handleStudySubmit={handleStudySubmit}
          submitError={submitError}
          isSubmitting={isSubmitting}
          setSubmitError={setSubmitError}
        />
      )}

      {showUclStaffModal && (
        <Dialog setDialogOpen={setShowUclStaffModal} cy="ucl-staff-restriction-modal">
          <h2>UCL Staff Only</h2>
          <p>Only UCL staff members can create studies.</p>
          <p>If you believe this is an error, please contact your administrator.</p>
          <div className={styles["ucl-staff-modal-actions"]}>
            <Button onClick={() => setShowUclStaffModal(false)} variant="secondary">
              Close
            </Button>
          </div>
        </Dialog>
      )}

      {!userData.roles.includes("approved-staff-researcher") && studies.length === 0 ? (
        <div className={styles["no-studies-message"]}>
          <h2>You haven&apos;t been added to any studies yet</h2>
          <p>Any studies you are added to will appear here once they have been created by a member of staff.</p>
        </div>
      ) : studies.length === 0 ? (
        <div className={styles["no-studies-message"]}>
          <h2>You haven&apos;t created any studies yet</h2>

          <Button onClick={handleCreateStudyClick} size="large">
            Create Your First Study
          </Button>
        </div>
      ) : (
        <>
          <div className={styles["create-study-section"]}>
            <Button onClick={handleCreateStudyClick} size="large">
              Create New Study
            </Button>
          </div>

          <StudySelection studies={studies} isAdmin={false} />
        </>
      )}
    </>
  );
}

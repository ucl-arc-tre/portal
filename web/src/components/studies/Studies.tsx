import { useState } from "react";
import StudySelection from "../studies/StudySelection";
import CreateStudyForm, { StudyFormData } from "./CreateStudyForm";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import { postStudies, Study, StudyCreateRequest } from "@/openapi";

import styles from "./Studies.module.css";

type Props = {
  studies: Study[];
  fetchStudies: () => void;
};

export default function Studies(props: Props) {
  const { studies, fetchStudies } = props;
  const [createStudyFormOpen, setCreateStudyFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // this should match the domain that is used for the entra ID users in the portal
  const domainName = process.env.NEXT_PUBLIC_DOMAIN_NAME || "@ucl.ac.uk";

  const handleStudySelect = (study: Study) => {
    // TODO: Navigate to study detail page or show study-specific content
    console.log("Selected study:", study);
  };

  const handleStudySubmit = async (data: StudyFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    console.log("Submitting study data:", data);

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

      if (response.response.ok === false) {
        setSubmitError("Failed to create study. Please try again.");
      }

      if (response.data) {
        setCreateStudyFormOpen(false);
        fetchStudies();
      }
    } catch (error) {
      console.error("Failed to create study:", error);
      setSubmitError("Failed to create study. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {createStudyFormOpen && (
        <CreateStudyForm setCreateStudyFormOpen={setCreateStudyFormOpen} onSubmit={handleStudySubmit} />
      )}

      {isSubmitting && <Loading message="Creating study..." />}

      {submitError && (
        <div className={styles["error-message"]}>
          <p>{submitError}</p>
          <Button onClick={() => setSubmitError(null)} variant="secondary" size="small">
            Dismiss
          </Button>
        </div>
      )}

      {studies.length === 0 ? (
        <div className={styles["no-studies-message"]}>
          <p>You haven&apos;t created any studies yet. Click the button below to create your first study.</p>

          <Button onClick={() => setCreateStudyFormOpen(true)} size="large">
            Create Your First Study
          </Button>
        </div>
      ) : (
        <>
          <div className={styles["create-study-section"]}>
            <Button onClick={() => setCreateStudyFormOpen(true)} size="large">
              Create New Study
            </Button>
          </div>

          <StudySelection studies={studies} handleStudySelect={handleStudySelect} />
        </>
      )}
    </>
  );
}

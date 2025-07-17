import { useState } from "react";
import StudySelection from "../studies/StudySelection";
import CreateStudyForm, { StudyFormData } from "./CreateStudyForm";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import { postStudies, Study, StudyCreateRequest } from "@/openapi";

import styles from "./Studies.module.css";

type Props = {
  username: string;
  studies: Study[];
  fetchStudies: () => void;
};

export default function Studies(props: Props) {
  const { username, studies, fetchStudies } = props;
  const [createStudyFormOpen, setCreateStudyFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleStudySelect = (study: Study) => {
    // TODO: Navigate to study detail page or show study-specific content
    console.log("Selected study:", study);
  };

  const handleStudySubmit = async (data: StudyFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Convert form data to StudyCreateRequest API format
      const studyData: StudyCreateRequest = {
        title: data.title,
        controller: data.controller as "UCL" | "Other",
        description: data.description ? data.description : undefined,
        admin: data.admin ? data.admin : undefined,
        controller_other: data.controllerOther ? data.controllerOther : undefined,
        ucl_sponsorship: data.uclSponsorship ? data.uclSponsorship : undefined,
        cag: data.cag ? data.cag : undefined,
        cag_ref: data.cagRef ? data.cagRef.toString() : undefined,
        ethics: data.ethics ? data.ethics : undefined,
        hra: data.hra ? data.hra : undefined,
        iras_id: data.irasId ? data.irasId : undefined,
        nhs: data.nhs ? data.nhs : undefined,
        nhs_england: data.nhsEngland ? data.nhsEngland : undefined,
        nhs_england_ref: data.nhsEnglandRef ? data.nhsEnglandRef.toString() : undefined,
        mnca: data.mnca ? data.mnca : undefined,
        dspt: data.dspt ? data.dspt : undefined,
        dbs: data.dbs ? data.dbs : undefined,
        data_protection: data.dataProtection ? data.dataProtection : undefined,
        data_protection_prefix: data.dataProtectionPrefix ? data.dataProtectionPrefix : undefined,
        data_protection_date: data.dataProtectionDate ? data.dataProtectionDate : undefined,
        data_protection_id: data.dataProtectionId ? data.dataProtectionId : undefined,
        data_protection_number:
          data.dataProtectionPrefix && data.dataProtectionDate && data.dataProtectionId
            ? `${data.dataProtectionPrefix}/${data.dataProtectionDate}/${data.dataProtectionId}`
            : undefined,
        third_party: data.thirdParty ? data.thirdParty : undefined,
        external_users: data.externalUsers ? data.externalUsers : undefined,
        consent: data.consent ? data.consent : undefined,
        non_consent: data.nonConsent ? data.nonConsent : undefined,
        ext_eea: data.extEea ? data.extEea : undefined,
      };

      const response = await postStudies({
        body: studyData,
      });

      if (response.data) {
        console.log("Study created successfully:", response.data);
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
        <CreateStudyForm
          username={username}
          setCreateStudyFormOpen={setCreateStudyFormOpen}
          onSubmit={handleStudySubmit}
        />
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

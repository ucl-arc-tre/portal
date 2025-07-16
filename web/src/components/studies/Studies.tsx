import { useState } from "react";
import StudySelection from "../studies/StudySelection";
import CreateStudyForm, { StudyFormData } from "./CreateStudyForm";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import { postStudies, Study } from "@/openapi";

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
      // Build the data protection number
      const dataProtectionNumber = `${data.dataProtectionPrefix}/${data.dataProtectionDate}/${data.dataProtectionId}`;

      // Convert form data to Study API format
      const studyData: Study = {
        id: "",
        owner_user_id: "",
        created_at: "",
        updated_at: "",
        title: data.title,
        description: data.description,
        admin: data.admin,
        controller: data.controller as "UCL" | "Other",
        controller_other: data.controllerOther,
        ucl_sponsorship: data.uclSponsorship,
        cag: data.cag,
        cag_ref: data.cagRef.toString(),
        ethics: data.ethics,
        hra: data.hra,
        iras_id: data.irasId,
        nhs: data.nhs,
        nhs_england: data.nhsEngland,
        nhs_england_ref: data.nhsEnglandRef.toString(),
        mnca: data.mnca,
        dspt: data.dspt,
        dbs: data.dbs,
        data_protection: data.dataProtection,
        data_protection_prefix: data.dataProtectionPrefix,
        data_protection_date: data.dataProtectionDate,
        data_protection_id: data.dataProtectionId,
        data_protection_number: dataProtectionNumber,
        third_party: data.thirdParty,
        external_users: data.externalUsers,
        consent: data.consent,
        non_consent: data.nonConsent,
        ext_eea: data.extEea,
      };

      // Submit to backend
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

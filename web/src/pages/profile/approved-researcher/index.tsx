import MetaHead from "@/components/meta/Head";
import ApprovedResearcherAgreement from "@/components/profile/approved-researcher/ApprovedResearcherAgreement";
import TrainingCertificateForm from "@/components/profile/approved-researcher/TrainingCertificateForm";

export default function ApprovedResearcherPage() {
  return (
    <>
      <MetaHead
        title="Become an Approved Researcher | ARC Services Portal"
        description="Submit your application to become an approved researcher"
      />
      <div>
        <h1>Become an Approved Researcher</h1>
        <p>To gain access to advanced services, please complete the following steps.</p>

        <ApprovedResearcherAgreement />
        <TrainingCertificateForm />
      </div>
    </>
  );
}

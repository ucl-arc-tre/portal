import ApprovedResearcherAgreement from "./components/ApprovedResearcherAgreement";

export const metadata = {
  title: "Become an Approved Researcher | ARC Portal",
  description: "Submit your application to become an approved researcher.",
};

export default function ApprovedResearcherPage() {
  return (
    <div className="profile-page">
      <h1>Become an Approved Researcher</h1>
      <p>To gain access to advanced services, please complete the following steps.</p>

      <ApprovedResearcherAgreement />
    </div>
  );
}

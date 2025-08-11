import ExternalInvite from "./ExternalInvite";

export default function ApprovedResearcherView({ isStaff }: { isStaff: boolean }) {
  return (
    <>
      {isStaff ? (
        <>
          <h4>View users in your projects or invite a collaborator</h4>
          <ExternalInvite />
        </>
      ) : (
        <h4>View users in your projects</h4>
      )}
      {/* rest of content to be implemented once project logic has been done */}
    </>
  );
}

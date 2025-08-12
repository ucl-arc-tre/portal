import ExternalInvite from "./ExternalInvite";

export default function ApprovedResearcherView({ isStaff }: { isStaff: boolean }) {
  return (
    <>
      {isStaff && (
        <>
          <ExternalInvite />
        </>
      )}
      {/* rest of content to be implemented once project logic has been done */}
    </>
  );
}

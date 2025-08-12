import Callout from "../ui/Callout";
import ExternalInvite from "./ExternalInvite";

export default function ApprovedResearcherView({ isIAO }: { isIAO: boolean }) {
  return (
    <>
      {isIAO && (
        <>
          <ExternalInvite />
        </>
      )}
      <Callout construction />
      {/* rest of content to be implemented once project logic has been done */}
    </>
  );
}

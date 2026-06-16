import { Alert, AlertMessage, Input, Label } from "@/components/shared/uikitExports";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import Loading from "@/components/ui/Loading";
import { useAuth } from "@/hooks/useAuth";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import { postStudiesAdminByStudyIdOwnerRequest, postStudiesByStudyIdOwnerRequest, Study } from "@/openapi";
import { useState } from "react";

type StudyOwnerEditProps = {
  setDialogOpen: (show: boolean) => void;
  study: Study;
};

export default function StudyOwnerEdit(props: StudyOwnerEditProps) {
  const { setDialogOpen, study } = props;

  const { userData } = useAuth();
  const isStudyOwner =
    (userData?.roles.includes("information-asset-owner") && study.owner_username === userData?.username) || false;
  const isIgOps = userData?.roles.includes("ig-ops-staff");

  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email) {
      setErrorMessage("New owner email must be set");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    const data = { path: { studyId: study.id }, body: { username: email } };
    let response;
    try {
      if (isIgOps) {
        response = await postStudiesAdminByStudyIdOwnerRequest(data);
      } else {
        response = await postStudiesByStudyIdOwnerRequest(data);
      }

      if (responseIsError(response)) {
        setErrorMessage(`Failed to update study status: ${extractErrorMessage(response)}.`);
      } else {
        setSuccessMessage("Succeeded");
      }
    } catch {
      setErrorMessage("Failed to update study status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog setDialogOpen={setDialogOpen}>
      <h2>Edit Study Owner</h2>

      <form onSubmit={handleSubmit} className={"form"}>
        <Label htmlFor="email"></Label>
        <Input
          type="email"
          id="email"
          placeholder="Email address"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
        <Alert type="warning">
          <AlertMessage>
            {isStudyOwner
              ? "Please ensure the new study owner is aware of the transfer and is willing to accept the responsibility. The transfer will require information goveranance approval."
              : "Note that the transfer will require approval."}
          </AlertMessage>
        </Alert>
        {successMessage === "" && (
          <Button disabled={isLoading} type="submit" cy="request-study-owner-edit-submit">
            {isLoading && <Loading message="" size="small" />}
            Submit Request
          </Button>
        )}

        {(errorMessage || successMessage) && (
          <Alert type={errorMessage ? "error" : "success"}>
            <AlertMessage>{errorMessage || successMessage}</AlertMessage>
          </Alert>
        )}
      </form>
    </Dialog>
  );
}

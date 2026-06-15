import { Alert, AlertMessage, Input, Label } from "@/components/shared/uikitExports";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import Loading from "@/components/ui/Loading";
import { useAuth } from "@/hooks/useAuth";
import { Study } from "@/openapi";
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

  const [email, setEmail] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function handleSubmit() {}

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
          required={true}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
        />
        <Alert type="warning">
          <AlertMessage>
            {isStudyOwner
              ? "Please ensure the new study owner is aware of the transfer and is willing to accept the responsibility. The transfer will require information goveranance approval."
              : "Note that the transfer will require approval."}
          </AlertMessage>
        </Alert>
        <Button disabled={isLoading} type="submit" cy="request-study-owner-edit-button">
          {isLoading && <Loading message="" size="small" />}
          Submit Request
        </Button>

        {(errorMessage || successMessage) && (
          <Alert type={errorMessage ? "error" : "success"}>
            <AlertMessage>{errorMessage || successMessage}</AlertMessage>
          </Alert>
        )}
      </form>
    </Dialog>
  );
}

import { useEffect, useState } from "react";
import Box from "../ui/Box";
import Dialog from "../ui/Dialog";
import Button from "../ui/Buttons";
import { useForm } from "react-hook-form";
import { deleteTokensDshByTokenId, getTokensDsh, postTokensDsh, Token } from "@/openapi";
import { extractErrorMessage } from "@/lib/errorHandler";
import styles from "./DSHTokens.module.css";
import { Alert, AlertMessage, HelperText, Label } from "../shared/exports";

type FormData = {
  name: string;
  expiryDays: string;
};

export default function DSHTokens() {
  const [formOpen, setFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Array<Token>>([]);
  const [tokenValue, setTokenValue] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await getTokensDsh();
        if (!response.response.ok || !response.data) {
          const errorMsg = extractErrorMessage(response);
          setErrorMessage(`Failed to load tokens: ${errorMsg}`);
          return;
        }
        setTokens(response.data);
      } catch {
        setErrorMessage("Failed to load tokens. Please try again later.");
      }
    };
    fetchTokens();
  }, [setTokens]);

  const handleCloseForm = () => {
    setFormOpen(false);
    setTokenValue(null);
  };

  const handleCreateClick = () => {
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const userConfirmed = window.confirm("Are you sure you want to revoke this token?");
    if (!userConfirmed) {
      return;
    }

    setErrorMessage(null);
    const response = await deleteTokensDshByTokenId({
      path: { tokenId: id },
    });
    if (!response.response.ok) {
      const errorMsg = extractErrorMessage(response);
      setErrorMessage(`Failed to delete token: ${errorMsg}`);
      return;
    }
    setTokens(tokens.filter((token) => token.id !== id));
  };

  const onFormSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setFormErrorMessage(null);

      const response = await postTokensDsh({
        body: {
          name: data.name,
          valid_for_days: parseInt(data.expiryDays),
        },
      });
      if (!response.response.ok || !response.data) {
        const errorMsg = extractErrorMessage(response);
        setFormErrorMessage(errorMsg);
        return;
      }

      setTokenValue(response.data.value);
      const newToken: Token = {
        id: response.data.id,
        name: data.name,
        expires_at: response.data.expires_at,
      };
      setTokens([...tokens, newToken]);
    } catch (error) {
      console.error("Error creating token:", error);
      setFormErrorMessage("Error: " + String((error as Error).message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
    },
  });

  return (
    <>
      <Box>
        <div className={styles["title-container"]}>
          <h3>DSH API Tokens</h3>
          <Button onClick={handleCreateClick} data-cy="create-dsh-token-button">
            Create
          </Button>
        </div>

        {tokens.length == 0 && !tokenValue && (
          <div className={styles.list}>
            <p>No items to display</p>
            <HelperText>
              <a href="https://github.com/ucl-arc-tre/portal/blob/main/api/dsh.yaml">DSH API</a> tokens can be used to
              query the state of approved researchers and studies from the portal.
            </HelperText>
          </div>
        )}

        {tokens.length > 0 && (
          <div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Expiry</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {tokens.map((token) => (
                  <tr key={token.id} className={styles.row}>
                    <td>{token.name}</td>
                    <td>{token.expires_at}</td>
                    <td>
                      <Button
                        onClick={() => handleDelete(token.id)}
                        aria-label={`Delete ${token.name}`}
                        variant="secondary"
                        size="small"
                        className="delete-button"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {errorMessage && (
          <Alert type="error" className={styles.alert}>
            <AlertMessage>{errorMessage}</AlertMessage>
          </Alert>
        )}
      </Box>

      {formOpen && (
        <Dialog setDialogOpen={handleCloseForm} cy="create-dsh-token-form">
          {!tokenValue && (
            <form onSubmit={handleSubmit(onFormSubmit)} className="form">
              <h3>DSH API Tokens</h3>
              <div className={styles.field}>
                <Label htmlFor="name">Name *</Label>
                <input
                  id="name"
                  type="text"
                  {...register("name", {
                    required: "Name is required",
                    minLength: { value: 1, message: "Name must be at least 1 characters" },
                    maxLength: { value: 50, message: "Name must be less than 50 characters" },
                  })}
                  aria-invalid={!!errors.name}
                  className={errors.name ? styles.error : ""}
                />
                {errors.name && (
                  <Alert type="error">
                    <AlertMessage>{errors.name.message}</AlertMessage>
                  </Alert>
                )}
              </div>

              <div className={styles.field}>
                <Label htmlFor="expiryDays">Expires after *</Label>
                <select {...register("expiryDays")}>
                  <option value="7">7 Days</option>
                  <option value="30">1 Month</option>
                  <option value="90">3 Months</option>
                  <option value="180">6 Months</option>
                  <option value="365">1 Year</option>
                </select>
              </div>

              {formErrorMessage && (
                <Alert type="error" className={styles.alert}>
                  <AlertMessage>{formErrorMessage}</AlertMessage>
                </Alert>
              )}

              <div className={styles.actions}>
                <Button type="submit" disabled={isSubmitting} className={styles["submit-button"]}>
                  {isSubmitting ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          )}

          {tokenValue && (
            <div className={styles["token-container"]}>
              <Alert type="info">
                Use this bearer token for the{" "}
                <a href="https://github.com/ucl-arc-tre/portal/blob/main/api/dsh.yaml">DSH API</a> with e.g.
                <p className={styles.code}>
                  {`curl -H "Authorization: Bearer <token>" \ https://portal.arc.ucl.ac.uk/dsh/api/v0/approved-researchers`}
                </p>
              </Alert>
              <div className={styles["token-display"]} data-cy="dsh-token-value">
                {tokenValue}
              </div>
              <Alert type="warning">
                <AlertMessage>Save this token securely now. It will not be shown again</AlertMessage>
              </Alert>
            </div>
          )}
        </Dialog>
      )}
    </>
  );
}

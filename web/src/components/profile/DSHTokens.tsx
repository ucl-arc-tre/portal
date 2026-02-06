import { useEffect, useState } from "react";
import Box from "../ui/Box";
import Dialog from "../ui/Dialog";
import Button from "../ui/Button";
import { useForm } from "react-hook-form";
import { deleteTokensDshByTokenId, getTokensDsh, postTokensDsh, Token } from "@/openapi";
import styles from "./DSHTokens.module.css";
import { Alert, AlertMessage, Label } from "../shared/exports";

type FormData = {
  name: string;
};

export default function DSHTokens() {
  const [formOpen, setFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
  const [successFormMessage, setFormSuccessMessage] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Array<Token>>([]);
  const [tokenValue, setTokenValue] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      const response = await getTokensDsh();
      if (!response.response.ok || !response.data) {
        // todo
        throw new Error(`Failed to get tokens`);
      }
      setTokens(response.data);
    };
    fetchTokens();
  }, [setTokens]);

  const handleCloseForm = () => {
    setFormOpen(false);
  };

  const handleCreateClick = () => {
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const response = await deleteTokensDshByTokenId({
      path: {
        tokenId: id,
      },
    });

    setTokens(tokens.filter((token) => token.id !== id));
    console.log(response); // todo
  };

  const onFormSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setFormErrorMessage(null);
      setFormSuccessMessage(null);

      const response = await postTokensDsh({
        body: {
          name: data.name,
          valid_for_days: 90, // todo - make configurable?
        },
      });
      if (!response.response.ok) {
        throw new Error(`Failed to create token`);
      }
      setFormSuccessMessage("Token created successfully!");
      setTokenValue(response.data?.value || null);
      reset();
    } catch (error) {
      console.error("Error creating token:", error);
      setFormErrorMessage("Error: " + String((error as Error).message));
    } finally {
      setIsSubmitting(false);
    }
    setFormOpen(false);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      name: "",
    },
  });

  return (
    <>
      <Box>
        <h4>DSH API Tokens</h4>
        <div className={styles.add}>
          <Button onClick={handleCreateClick} data-cy="create-dsh-token-button">
            Add token
          </Button>
        </div>

        {tokens.length == 0 && <p> No items to display</p>}

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

        {tokenValue && (
          <div>
            <p>Copy this token now. It will not be shown again</p>
            <span>{tokenValue}</span>
          </div>
        )}
      </Box>

      {formOpen && (
        <Dialog setDialogOpen={handleCloseForm} cy="create-dsh-token-form">
          <form onSubmit={handleSubmit(onFormSubmit)} className="form">
            <div className={styles.field}>
              <Label htmlFor="name">Name *</Label>
              <input
                id="name"
                type="text"
                {...register("name", {
                  required: "Name is required",
                  minLength: { value: 1, message: "Name must be at least 1 characters" },
                  maxLength: { value: 50, message: "Title must be less than 50 characters" },
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

            {formErrorMessage && (
              <Alert type="error" className={styles.alert}>
                <AlertMessage>{formErrorMessage}</AlertMessage>
              </Alert>
            )}

            {successFormMessage && (
              <Alert type="success" className={styles.alert}>
                <AlertMessage>{successFormMessage}</AlertMessage>
              </Alert>
            )}

            <div className={styles.actions}>
              <Button type="submit" disabled={isSubmitting} className={styles["submit-button"]}>
                {isSubmitting ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </>
  );
}

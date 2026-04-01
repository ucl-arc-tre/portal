import { useState, useRef, useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import {
  postStudiesByStudyIdContracts,
  postStudiesByStudyIdContractsByContractIdObjects,
  putStudiesByStudyIdContractsByContractId,
  ContractBase,
  Study,
  Contract,
  Asset,
  getStudiesByStudyIdAssets,
} from "@/openapi";
import { extractErrorMessage } from "@/lib/errorHandler";
import styles from "./ContractUploadForm.module.css";
import { HelperText, AlertMessage, Alert, Label } from "../shared/uikitExports";

type ContractFormData = {
  title: string;
  organisationSignatoryEmail: string;
  thirdPartyName: string;
  otherSignatories: string | undefined;
  status: "proposed" | "active" | "expired";
  startDate: string;
  expiryDate: string;
  assets: { value: string }[];
};

type ContractUploadModalProps = {
  study: Study;
  onClose: () => void;
  onSuccess: () => void;
  editingContract?: Contract;
};

const validMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

export default function ContractUploadModal({ study, onClose, onSuccess, editingContract }: ContractUploadModalProps) {
  const [uploadFiles, setUploadFiles] = useState<Array<File>>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setSuccess] = useState(false);
  const [studyAssets, setStudyAssets] = useState<Asset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentContract, setCurrentContract] = useState<Contract | null>(editingContract ?? null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const organisationName = process.env.NEXT_PUBLIC_ORGANISATION_NAME;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
  } = useForm<ContractFormData>({
    defaultValues: {
      status: "proposed",
    },
  });

  const selectedAssetIds = watch("assets");
  const {
    fields: assetFields,
    append: appendAsset,
    remove: removeAsset,
  } = useFieldArray({
    control,
    name: "assets",
  });

  useEffect(() => {
    setCurrentContract(editingContract ?? null);

    // populate form with existing data when editing
    if (editingContract) {
      reset({
        title: editingContract.title,
        organisationSignatoryEmail: editingContract.organisation_signatory,
        otherSignatories: editingContract.other_signatories,
        thirdPartyName: editingContract.third_party_name,
        status: editingContract.status,
        startDate: editingContract.start_date,
        expiryDate: editingContract.expiry_date,
        assets: editingContract.asset_ids.map((id) => ({ value: id })),
      });
    } else {
      // reset to defaults when not editing
      reset({
        status: "proposed",
        organisationSignatoryEmail: "",
        thirdPartyName: "",
        startDate: "",
        expiryDate: "",
        otherSignatories: undefined,
        assets: [],
      });
    }

    const fetchAssets = async () => {
      setIsLoadingAssets(true);
      try {
        const response = await getStudiesByStudyIdAssets({ path: { studyId: study.id } });
        if (!response.response.ok || !response.data) {
          const errorMsg = extractErrorMessage(response);
          setError(`Something went wrong: ${errorMsg}`);
          return;
        }
        setStudyAssets(response.data);
      } finally {
        setIsLoadingAssets(false);
      }
    };

    fetchAssets();
  }, [editingContract, reset, study.id]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      setUploadFiles([]);
      return;
    }

    setError(null);
    setSuccess(false);

    let filesError: undefined | string = undefined;
    Array.from(event.target.files).forEach((file) => {
      if (!file) {
        filesError = "File was nil";
        return;
      }

      if (!validMimeTypes.includes(file.type)) {
        filesError = `File format must be one of ${validMimeTypes}.`;
        return;
      }

      if (file.size > 1e7) {
        filesError = "File size must be less than 10MB.";
        return;
      }
    });

    if (filesError) {
      setUploadFiles([]);
      setError(filesError);
      return;
    }

    setUploadFiles(Array.from(event.target.files));
  };

  const onSubmit = async (formData: ContractFormData) => {
    // For upload mode, file is required
    if (!editingContract && uploadFiles.length === 0) {
      setError("Please select a file before submitting.");
      return;
    }
    setUploading(true);
    setIsSubmitting(true);
    setError(null);

    const body: ContractBase = {
      title: formData.title,
      organisation_signatory: formData.organisationSignatoryEmail,
      third_party_name: formData.thirdPartyName,
      status: formData.status,
      start_date: formData.startDate,
      expiry_date: formData.expiryDate,
      other_signatories: formData.otherSignatories,
      asset_ids: formData.assets.map((asset) => asset.value).filter((id) => id !== "") as string[],
    };

    let response;
    try {
      if (currentContract) {
        response = await putStudiesByStudyIdContractsByContractId({
          path: {
            studyId: study.id,
            contractId: currentContract.id,
          },
          body: body,
        });
      } else {
        // Upload new contract
        response = await postStudiesByStudyIdContracts({
          path: {
            studyId: study.id,
          },
          body: body,
        });
      }

      if (!response.response.ok || !response.data) {
        const errorMsg = extractErrorMessage(response);
        setError(errorMsg);
        setSuccess(false);
        return;
      }
      const contractId = response.data.id;
      setCurrentContract(response.data);

      while (uploadFiles.length > 0) {
        const file = uploadFiles.pop()!;
        response = await postStudiesByStudyIdContractsByContractIdObjects({
          path: {
            studyId: study.id,
            contractId: contractId,
          },
          body: { file },
        });
        if (!response.response.ok) break;
      }

      if (!response.response.ok) {
        const errorMsg = extractErrorMessage(response);
        setError(errorMsg);
        setSuccess(false);
        return;
      }

      setSuccess(true);
      setUploadFiles([]);
      reset();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onSuccess();
    } catch (error) {
      console.error(editingContract ? "Update failed:" : "Upload failed:", error);
      setError("Error: " + String((error as Error).message));
      setSuccess(false);
    } finally {
      setUploading(false);
      setIsSubmitting(false);
    }
  };

  const clearFile = () => {
    setUploadFiles([]);
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    reset();
    setUploadFiles([]);
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  return (
    <Dialog setDialogOpen={handleClose}>
      <h2>{editingContract ? "Edit Contract" : "Upload Contract"}</h2>
      <p className={styles.description}>
        {editingContract
          ? "Edit the contract details below. You can optionally upload new files to replace the existing one."
          : "Add contract details and files below."}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="form">
        <div className={styles["form-section"]}>
          <div className={styles["form-group"]}>
            <Label htmlFor="title">Title *</Label>
            <input
              id="title"
              type="text"
              {...register("title", {
                required: "Title is required",
                minLength: { value: 2, message: "Title must be at least 2 characters" },
                maxLength: { value: 100, message: "Title must be less than 100 characters" },
              })}
              className={styles["form-input"]}
              placeholder="Title of the contract"
            />
            {errors.title && <span className={styles["form-error"]}>{errors.title.message}</span>}
          </div>

          <div className={styles["form-group"]}>
            <Label htmlFor="organisationSignatoryEmail">{organisationName} Signatory *</Label>
            <input
              id="organisationSignatoryEmail"
              type="text"
              {...register("organisationSignatoryEmail", {
                required: "Organisation Signatory is required",
                pattern: {
                  value: RegExp(`^[^@]+${process.env.NEXT_PUBLIC_DOMAIN_NAME}$`),
                  message: `Must be a valid email address ending with ${process.env.NEXT_PUBLIC_DOMAIN_NAME}`,
                },
              })}
              className={styles["form-input"]}
              placeholder="Enter organisation signatory email"
            />
            {errors.organisationSignatoryEmail && (
              <span className={styles["form-error"]}>{errors.organisationSignatoryEmail.message}</span>
            )}
          </div>

          <div className={styles["form-group"]}>
            <Label htmlFor="title">Other Signatories</Label>
            <input
              id="otherSignatories"
              type="text"
              {...register("otherSignatories", {
                minLength: { value: 1, message: "Other Signatories must be at least 1 character" },
                maxLength: { value: 255, message: "Other Signatories must be less than 256 characters" },
              })}
              className={styles["form-input"]}
              placeholder="e.g. Alice Smith, bob@example.com, NHS England"
            />
            {errors.title && <span className={styles["form-error"]}>{errors.title.message}</span>}
          </div>

          <div className={styles["form-group"]}>
            <Label htmlFor="thirdPartyName">Third Party Name *</Label>
            <input
              id="thirdPartyName"
              type="text"
              {...register("thirdPartyName", {
                required: "Third Party Name is required",
                minLength: { value: 2, message: "Third Party Name must be at least 2 characters" },
                maxLength: { value: 100, message: "Third Party Name must be less than 100 characters" },
              })}
              className={styles["form-input"]}
              placeholder="Enter the other party in the contract (e.g. an organisation or a person)"
            />
            {errors.thirdPartyName && <span className={styles["form-error"]}>{errors.thirdPartyName.message}</span>}
          </div>

          <div className={styles["form-group"]}>
            <Label htmlFor="status">Contract Status *</Label>
            <select
              id="status"
              {...register("status", {
                required: "Status is required",
              })}
              className={styles["form-select"]}
            >
              <option value="proposed">Proposed</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
            {errors.status && <span className={styles["form-error"]}>{errors.status.message}</span>}
          </div>

          <div className={styles["form-group"]}>
            <Label htmlFor="startDate">Start Date *</Label>
            <input
              id="startDate"
              type="date"
              {...register("startDate", {
                required: "Start date is required",
              })}
              className={styles["form-input"]}
            />
            {errors.startDate && <span className={styles["form-error"]}>{errors.startDate.message}</span>}
          </div>

          <div className={styles["form-group"]}>
            <Label htmlFor="expiryDate">Expiry Date *</Label>
            <input
              id="expiryDate"
              type="date"
              {...register("expiryDate", {
                required: "Expiry date is required",
              })}
              className={styles["form-input"]}
            />
            {errors.expiryDate && <span className={styles["form-error"]}>{errors.expiryDate.message}</span>}
          </div>
        </div>

        <div className={styles["form-section"]}>
          <h4>Link Assets (optional)</h4>
          <div className={styles["form-group"]}>
            <fieldset className="linkage-fieldset">
              {assetFields.map((field, index) => (
                <div key={field.id} className="item-wrapper">
                  <label htmlFor={`asset-${index}`} className="item-label">
                    Asset {index + 1}:
                  </label>

                  <Controller
                    name={`assets.${index}.value` as const}
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        id={`asset-${index}`}
                        className={styles.select}
                        disabled={isSubmitting || isLoadingAssets}
                      >
                        <option value="">
                          {isLoadingAssets
                            ? "Loading assets..."
                            : studyAssets.length === 0
                              ? "No assets available for this study"
                              : "Select an asset (optional)..."}
                        </option>
                        {studyAssets.map((asset) => {
                          const isAlreadySelected = selectedAssetIds.some(
                            (selected, selectedIndex) => selected.value === asset.id && selectedIndex !== index
                          );

                          return (
                            <option key={asset.id} value={asset.id} disabled={isAlreadySelected}>
                              {asset.title}
                              {isAlreadySelected ? " - Already selected" : ""}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  />
                  <Button
                    onClick={() => removeAsset(index)}
                    className="remove-button"
                    aria-label={`Remove contract ${index + 1}`}
                    type="button"
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button
                onClick={() => appendAsset({ value: "" })}
                type="button"
                variant="secondary"
                size="small"
                aria-label="Add Asset"
                cy="add-asset"
              >
                Add Asset
              </Button>
            </fieldset>
            <HelperText>Optionally link this contract to one or more existing assets from this study</HelperText>
          </div>
        </div>

        <h3>Files</h3>

        <div className={styles["upload-section"]}>
          <div className={styles["file-input"]}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className={styles["hidden-input"]}
              id="contract-file-input"
              multiple
            />
            <Label htmlFor="contract-file-input" className={styles["file-label"]}>
              <div className={styles["upload-icon"]}>📄</div>
              <span>{editingContract ? "Choose new files (optional)" : "Choose files or drag and drop"}</span>
            </Label>
          </div>
          <HelperText>Only PDF, Word, PNG, and JPEG files up to 10MB are accepted.</HelperText>

          {uploadFiles.map((file, index) => (
            <div key={index} className={styles["selected-file"]}>
              <div className={styles["file-info"]}>
                <span className={styles["file-name"]}>{file.name}</span>
              </div>
              <Button onClick={clearFile} size="small" variant="tertiary">
                Remove
              </Button>
            </div>
          ))}

          {uploadSuccess && (
            <div className={styles.success}>
              {editingContract ? "Contract updated successfully!" : "Contract uploaded successfully!"}
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <Button type="submit" disabled={uploading} size="large">
            {uploading
              ? editingContract
                ? "Updating..."
                : "Uploading..."
              : editingContract
                ? "Update Contract"
                : "Upload Contract"}
          </Button>
          <Button type="button" onClick={handleClose} variant="secondary" size="large">
            Cancel
          </Button>
        </div>
        {error && (
          <Alert type="error">
            <AlertMessage>{error}</AlertMessage>
          </Alert>
        )}
      </form>
    </Dialog>
  );
}

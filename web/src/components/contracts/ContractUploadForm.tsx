import { useState, useRef, useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import {
  postStudiesByStudyIdContractsUpload,
  putStudiesByStudyIdContractsByContractId,
  ValidationError,
  ContractUploadObject,
  ContractUpdate,
  Study,
  Contract,
  Asset,
  getStudiesByStudyIdAssets,
} from "@/openapi";
import styles from "./ContractUploadForm.module.css";
import { HelperText, Label } from "../shared/exports";

type ContractFormData = {
  organisationSignatory: string;
  thirdPartyName: string;
  status: "proposed" | "active" | "expired";
  startDate: string;
  expiryDate: string;
  assetIds: { value: string }[];
};

type ContractUploadModalProps = {
  study: Study;
  throughAsset?: Asset;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingContract?: Contract | null;
};

export default function ContractUploadModal({
  study,
  throughAsset,
  isOpen,
  onClose,
  onSuccess,
  editingContract,
}: ContractUploadModalProps) {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [assetIds, setAssetIds] = useState<string[]>(throughAsset ? [throughAsset.id] : []);
  const [studyAssets, setStudyAssets] = useState<Asset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      assetIds: assetIds.map((id) => ({ value: id })),
    },
  });

  const selectedAssetIds = watch("assetIds");
  const {
    fields: assetFields,
    append: appendAsset,
    remove: removeAsset,
  } = useFieldArray({
    control,
    name: "assetIds",
  });

  useEffect(() => {
    // populate form with existing data when editing
    if (editingContract) {
      const combinedAssetIds = [...editingContract.asset_ids];
      if (throughAsset && !combinedAssetIds.includes(throughAsset.id)) {
        combinedAssetIds.push(throughAsset.id);
      }
      setAssetIds(combinedAssetIds as string[]);
      reset({
        organisationSignatory: editingContract.organisation_signatory,
        thirdPartyName: editingContract.third_party_name,
        status: editingContract.status,
        startDate: editingContract.start_date,
        expiryDate: editingContract.expiry_date,
        assetIds: combinedAssetIds.map((id) => ({ value: id })),
      });
    } else {
      // reset to defaults when not editing
      reset({
        status: "proposed",
        organisationSignatory: "",
        thirdPartyName: "",
        startDate: "",
        expiryDate: "",
        assetIds: [],
      });
    }

    const fetchAssets = async () => {
      setIsLoadingAssets(true);
      try {
        const response = await getStudiesByStudyIdAssets({ path: { studyId: study.id } });
        if (response.response.ok && response.data) {
          setStudyAssets(response.data);
        } else {
          throw new Error(`Failed to fetch assets: ${response.response.status} ${response.response.statusText}`);
        }
      } catch (err) {
        console.error("Failed to load assets for contract form:", err);
        setError("Failed to load assets. Please try again later.");
      } finally {
        setIsLoadingAssets(false);
      }
    };

    fetchAssets();
  }, [editingContract, reset, throughAsset, study.id]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    setUploadSuccess(false);

    if (!file) {
      setUploadFile(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setError("File format must be PDF.");
      setUploadFile(null);
      return;
    }

    if (file.size > 1e7) {
      setError("File size must be less than 10MB.");
      setUploadFile(null);
      return;
    }

    setUploadFile(file);
  };

  const onSubmit = async (formData: ContractFormData) => {
    // For upload mode, file is required
    if (!editingContract && !uploadFile) {
      setError("Please select a PDF file before uploading.");
      return;
    }

    setUploading(true);
    setIsSubmitting(true);
    setError(null);

    const contractData: ContractUpdate | ContractUploadObject = {
      organisation_signatory: formData.organisationSignatory,
      third_party_name: formData.thirdPartyName,
      status: formData.status,
      start_date: formData.startDate,
      expiry_date: formData.expiryDate,
      asset_ids: assetIds,
    };

    let response;
    try {
      if (editingContract) {
        // Update existing contract
        const contractUpdateData: ContractUpdate = {
          ...contractData,
          file: uploadFile || undefined,
        };

        response = await putStudiesByStudyIdContractsByContractId({
          path: {
            studyId: study.id,
            contractId: editingContract.id,
          },
          body: contractUpdateData,
        });
      } else {
        // Upload new contract
        const contractUploadData: ContractUploadObject = {
          ...contractData,
          file: uploadFile!,
        };

        response = await postStudiesByStudyIdContractsUpload({
          path: {
            studyId: study.id,
          },
          body: contractUploadData,
        });
      }

      if (response.error) {
        const errorData = response.error as ValidationError;
        if (errorData?.error_message) {
          throw new Error(errorData.error_message);
        }
      }

      if (!response.response.ok) {
        throw new Error(`Update failed: ${response.response.status} ${response.response.statusText}`);
      }

      setUploadSuccess(true);
      setUploadFile(null);
      reset();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onSuccess();
      setTimeout(() => {
        onClose();
        setUploadSuccess(false);
      }, 1500);
    } catch (error) {
      console.error(editingContract ? "Update failed:" : "Upload failed:", error);
      setError("Error: " + String((error as Error).message));
    } finally {
      setUploading(false);
      setIsSubmitting(false);
    }
  };

  const clearFile = () => {
    setUploadFile(null);
    setError(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    reset();
    setUploadFile(null);
    setError(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog setDialogOpen={handleClose}>
      <h2>{editingContract ? "Edit Contract" : "Upload Contract"}</h2>
      <p className={styles.description}>
        {editingContract
          ? "Edit the contract details below. You can optionally upload a new PDF file to replace the existing one."
          : "Upload a PDF contract document for this asset. Only PDF files up to 10MB are accepted."}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="form">
        <div className={styles["upload-section"]}>
          <div className={styles["file-input"]}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
              className={styles["hidden-input"]}
              id="contract-file-input"
            />
            <Label htmlFor="contract-file-input" className={styles["file-label"]}>
              <div className={styles["upload-icon"]}>📄</div>
              <span>{editingContract ? "Choose new PDF file (optional)" : "Choose PDF file or drag and drop"}</span>
            </Label>
          </div>

          {uploadFile && (
            <div className={styles["selected-file"]}>
              <div className={styles["file-info"]}>
                <span className={styles["file-name"]}>{uploadFile.name}</span>
              </div>
              <Button onClick={clearFile} size="small" variant="tertiary">
                Remove
              </Button>
            </div>
          )}

          {/* Show current file when editing */}
          {editingContract && !uploadFile && (
            <div className={styles["current-file"]}>
              <div className={styles["file-info"]}>
                <span className={styles["file-name"]}>Current file: {editingContract.filename}</span>
              </div>
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}

          {uploadSuccess && (
            <div className={styles.success}>
              {editingContract ? "Contract updated successfully!" : "Contract uploaded successfully!"}
            </div>
          )}
        </div>

        <div className={styles["form-section"]}>
          <h4>Contract Details</h4>

          <div className={styles["form-group"]}>
            <Label htmlFor="organisationSignatory">{organisationName} Signatory *</Label>
            <input
              id="organisationSignatory"
              type="text"
              {...register("organisationSignatory", {
                required: "Organisation Signatory is required",
                minLength: { value: 2, message: "Organisation Signatory must be at least 2 characters" },
                maxLength: { value: 100, message: "Organisation Signatory must be less than 100 characters" },
              })}
              className={styles["form-input"]}
              placeholder="Enter organisation signatory name"
            />
            {errors.organisationSignatory && (
              <span className={styles["form-error"]}>{errors.organisationSignatory.message}</span>
            )}
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
            <fieldset className={styles["dynamic-fieldset"]}>
              {assetFields.map((field, index) => (
                <div key={field.id} className={styles["item-wrapper"]}>
                  <label htmlFor={`asset-${index}`} className={styles["item-label"]}>
                    Asset {index + 1}:
                  </label>

                  <Controller
                    name={`assetIds.${index}.value` as const}
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

                  <button
                    type="button"
                    onClick={() => removeAsset(index)}
                    className={styles["remove-button"]}
                    aria-label={`Remove asset ${index + 1}`}
                  >
                    ×
                  </button>
                </div>
              ))}

              <Button
                className={styles["add-button"]}
                type="button"
                variant="secondary"
                size="small"
                onClick={() => appendAsset({ value: "" })}
              >
                Add Asset
              </Button>
            </fieldset>
            <HelperText>Optionally link this contract to one or more existing assets from this study</HelperText>
          </div>
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
      </form>
    </Dialog>
  );
}

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import {
  postStudiesByStudyIdAssetsByAssetIdContractsUpload,
  putStudiesByStudyIdAssetsByAssetIdContractsByContractId,
  ValidationError,
  ContractUploadObject,
  ContractUpdate,
  Study,
  Asset,
  Contract,
} from "@/openapi";
import styles from "./ContractUploadForm.module.css";
import { Label } from "../shared/exports";

type ContractFormData = {
  organisationSignatory: string;
  thirdPartyName: string;
  status: "proposed" | "active" | "expired";
  startDate: string;
  expiryDate: string;
};

type ContractUploadModalProps = {
  study: Study;
  asset: Asset;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingContract?: Contract | null;
};

export default function ContractUploadModal({
  study,
  asset,
  isOpen,
  onClose,
  onSuccess,
  editingContract,
}: ContractUploadModalProps) {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const organisationName = process.env.NEXT_PUBLIC_ORGANISATION_NAME;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContractFormData>({
    defaultValues: {
      status: "proposed",
    },
  });

  useEffect(() => {
    // populate form with existing data when editing
    if (editingContract) {
      reset({
        organisationSignatory: editingContract.organisation_signatory,
        thirdPartyName: editingContract.third_party_name,
        status: editingContract.status,
        startDate: editingContract.start_date,
        expiryDate: editingContract.expiry_date,
      });
    } else {
      // reset to defaults when not editing
      reset({
        status: "proposed",
        organisationSignatory: "",
        thirdPartyName: "",
        startDate: "",
        expiryDate: "",
      });
    }
  }, [editingContract, reset]);

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
    setError(null);

    const contractData: ContractUpdate | ContractUploadObject = {
      organisation_signatory: formData.organisationSignatory,
      third_party_name: formData.thirdPartyName,
      status: formData.status,
      start_date: formData.startDate,
      expiry_date: formData.expiryDate,
    };

    let response;
    try {
      if (editingContract) {
        // Update existing contract
        const contractUpdateData: ContractUpdate = {
          ...contractData,
          file: uploadFile || undefined,
        };

        response = await putStudiesByStudyIdAssetsByAssetIdContractsByContractId({
          path: {
            studyId: study.id,
            assetId: asset.id,
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

        response = await postStudiesByStudyIdAssetsByAssetIdContractsUpload({
          path: {
            studyId: study.id,
            assetId: asset.id,
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

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
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

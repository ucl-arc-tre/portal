import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import {
  postStudiesByStudyIdAssetsByAssetIdContractsUpload,
  ValidationError,
  ContractUploadObject,
  Study,
  Asset,
} from "@/openapi";
import styles from "./ContractUploadForm.module.css";

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
};

export default function ContractUploadModal({ study, asset, isOpen, onClose, onSuccess }: ContractUploadModalProps) {
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
    if (!uploadFile) {
      setError("Please select a PDF file before uploading.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const contractUploadData: ContractUploadObject = {
        file: uploadFile,
        organisation_signatory: formData.organisationSignatory,
        third_party_name: formData.thirdPartyName,
        status: formData.status,
        start_date: formData.startDate,
        expiry_date: formData.expiryDate,
      };

      const response = await postStudiesByStudyIdAssetsByAssetIdContractsUpload({
        path: {
          studyId: study.id,
          assetId: asset.id,
        },
        body: contractUploadData,
      });

      if (response.error) {
        const errorData = response.error as ValidationError;
        if (errorData?.error_message) {
          throw new Error(errorData.error_message);
        }
      }

      if (!response.response.ok) {
        throw new Error(`Upload failed: ${response.response.status} ${response.response.statusText}`);
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
      console.error("Upload failed:", error);
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
      <h2>Upload Contract</h2>
      <p className={styles.description}>
        Upload a PDF contract document for this asset. Only PDF files up to 10MB are accepted.
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
            <label htmlFor="contract-file-input" className={styles["file-label"]}>
              <div className={styles["upload-icon"]}>📄</div>
              <span>Choose PDF file or drag and drop</span>
            </label>
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

          {error && <div className={styles.error}>{error}</div>}

          {uploadSuccess && <div className={styles.success}>Contract uploaded successfully!</div>}
        </div>

        <div className={styles["form-section"]}>
          <h4>Contract Details</h4>

          <div className={styles["form-group"]}>
            <label htmlFor="organisationSignatory">{organisationName} Signatory *</label>
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
            <label htmlFor="thirdPartyName">Third Party Name *</label>
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
            <label htmlFor="status">Contract Status *</label>
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
            <label htmlFor="startDate">Start Date *</label>
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
            <label htmlFor="expiryDate">Expiry Date *</label>
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
            {uploading ? "Uploading..." : "Upload Contract"}
          </Button>
          <Button type="button" onClick={handleClose} variant="secondary" size="large">
            Cancel
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

import { useFormContext, useWatch } from "react-hook-form";
import { Asset, Study } from "@/openapi";
import { ProjectFormData } from "@/types/projects";

type Props = {
  approvedStudies: Study[];
  assets: Asset[];
};

export default function ProjectFormRedcapTier3({ approvedStudies, assets }: Props) {
  const { control } = useFormContext<ProjectFormData>();
  const name = useWatch({ control, name: "name" });
  const studyId = useWatch({ control, name: "studyId" });
  const assetIds = useWatch({ control, name: "assetIds" });
  const selectedAssetIds = [...new Set(assetIds.map((asset) => asset.value).filter(Boolean))];
  const study = approvedStudies.find((study) => study.id === studyId);

  return (
    <section aria-labelledby="redcap-project-review">
      <h3 id="redcap-project-review">Review REDCap Tier 3 project</h3>
      <p>Check your project details, then select Save Project to create the project.</p>
      <dl>
        <dt>Project name</dt>
        <dd>{name}</dd>
        <dt>Study</dt>
        <dd>{study?.title ?? studyId}</dd>
        <dt>Environment</dt>
        <dd>REDCap Tier 3</dd>
        <dt>Assets</dt>
        <dd>
          {selectedAssetIds.length > 0 ? (
            <ul>
              {selectedAssetIds.map((id) => (
                <li key={id}>{assets.find((asset) => asset.id === id)?.title ?? id}</li>
              ))}
            </ul>
          ) : (
            "No assets selected"
          )}
        </dd>
      </dl>
    </section>
  );
}

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Label, Textarea } from "@/components/ui/uikitExports";
import { Asset, Study } from "@/openapi";
import { ProjectFormData } from "@/types/projects";

type Props = {
  approvedStudies: Study[];
  assets: Asset[];
};

export default function ProjectFormRedcapTier3(props: Props) {
  const { control } = useFormContext<ProjectFormData>();

  return (
    <section aria-labelledby="redcap-project-review">
      <Label htmlFor="redcap-description">
        Description
        <Controller
          name="description"
          control={control}
          render={({ field }) => <Textarea {...field} id="redcap-description" />}
        />
      </Label>
    </section>
  );
}

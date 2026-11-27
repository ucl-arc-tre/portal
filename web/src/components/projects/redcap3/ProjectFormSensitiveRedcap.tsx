import { Controller, useFormContext } from "react-hook-form";
import { Label, Textarea } from "@/components/ui/uikitExports";
import { ProjectFormData } from "@/types/projects";

export default function ProjectFormRedcapTier3() {
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

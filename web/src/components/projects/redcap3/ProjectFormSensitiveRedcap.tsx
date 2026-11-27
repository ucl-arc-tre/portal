import { Controller, useFormContext } from "react-hook-form";
import { HelperText, Label, Textarea } from "@/components/ui/uikitExports";
import ErrorMessage from "@/components/ui/Error";
import { Project } from "@/openapi";
import { ProjectFormData } from "@/types/projects";
import styles from "./ProjectFormSensitiveRedcap.module.css";

type Props = {
  projects: Project[] | null;
  projectsError: string | null;
  fieldsDisabled: boolean;
};

const linkedProjectFields = [
  { name: "projectTreIds", label: "Linked TRE Projects", environment: "ARC Trusted Research Environment" },
  { name: "projectDshIds", label: "Linked DSH Projects", environment: "Data Safe Haven" },
] as const;

export default function ProjectFormRedcapTier3({ projects, projectsError, fieldsDisabled }: Props) {
  const { control } = useFormContext<ProjectFormData>();

  return (
    <section className={styles.section} aria-label="Sensitive REDCap project details">
      <div className="field">
        <Label htmlFor="redcap-description">Description</Label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => <Textarea {...field} id="redcap-description" disabled={fieldsDisabled} />}
        />
        <HelperText>Please add a description of the project including the data that will be collected.</HelperText>
      </div>
      {projectsError && <ErrorMessage message={projectsError} />}
      {linkedProjectFields.map(({ name, label, environment }) => {
        const options = projects?.filter((project) => project.environment_name === environment) ?? [];
        return (
          <div
            className="field"
            role="group"
            aria-labelledby={`${name}-label`}
            key={name}
            aria-describedby={`${name}-help`}
          >
            <Label id={`${name}-label`}>{label}</Label>
            <div className={styles.content}>
              <Controller
                name={name}
                control={control}
                render={({ field }) => (
                  <div className={styles.group}>
                    {options.map((project) => (
                      <Label className={styles.option} key={project.id} htmlFor={`${name}-${project.id}`}>
                        <input
                          id={`${name}-${project.id}`}
                          type="checkbox"
                          disabled={fieldsDisabled || projects === null || !!projectsError}
                          name={field.name}
                          value={project.id}
                          ref={field.ref}
                          onBlur={field.onBlur}
                          checked={field.value.includes(project.id)}
                          onChange={(event) =>
                            field.onChange(
                              event.target.checked
                                ? [...field.value, project.id]
                                : field.value.filter((id) => id !== project.id)
                            )
                          }
                        />
                        {project.name}
                      </Label>
                    ))}
                  </div>
                )}
              />
              <HelperText id={`${name}-help`}>
                {projectsError
                  ? "Projects could not be loaded."
                  : projects === null
                    ? "Loading projects..."
                    : options.length === 0
                      ? "No projects available to link."
                      : "Optional. Click a project to select it; click again to deselect."}
              </HelperText>
            </div>
          </div>
        );
      })}
    </section>
  );
}

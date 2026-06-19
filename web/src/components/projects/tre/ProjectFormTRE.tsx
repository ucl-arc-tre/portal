import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import InfoTooltip from "../../ui/InfoTooltip";
import { HelperText, Alert, AlertMessage } from "../../shared/uikitExports";
import { ProjectFormData } from "@/types/projects";
import Button from "@/components/ui/Button";
import { ProjectTre, ProjectTreRoleName } from "@/openapi";
import styles from "./ProjectFormTRE.module.css";

// this should match the domain that is used for the entra ID users in the portal
const domainName = process.env.NEXT_PUBLIC_DOMAIN_NAME || "@ucl.ac.uk";

type Role = {
  label: string;
  description: string;
};

const roles: Record<ProjectTreRoleName, Role> = {
  desktop_user: {
    label: "Desktop User",
    description: "Can access the desktop environment and work with data within the TRE",
  },
  ingresser: {
    label: "Ingresser",
    description: "Can upload data into the TRE environment",
  },
  egresser: {
    label: "Egresser",
    description: "Can download data from the TRE environment after approval",
  },
  egress_requester: {
    label: "Egress Requester",
    description: "Can request data to be downloaded from the TRE",
  },
  egress_checker: {
    label: "Egress Checker",
    description: "Can review and approve egress requests from other users",
  },
  trusted_egresser: {
    label: "Trusted Egresser",
    description: "Can download data from the TRE environment without requiring approval",
  },
};

type Props = {
  fieldsDisabled: boolean;
  editingProject: ProjectTre | null | undefined;
};

export default function ProjectFormTREStep(props: Props) {
  const { fieldsDisabled, editingProject } = props;
  const { watch, control, getValues, setValue } = useFormContext<ProjectFormData>();

  const {
    fields: researcherFields,
    append: appendResearcher,
    remove: removeResearcher,
  } = useFieldArray({
    control,
    name: "members",
  });

  const rolesMap = Object.entries(roles) as [ProjectTreRoleName, Role][];

  return (
    <div className="field">
      <span>Project users (optional):</span>
      <fieldset className="linkage-fieldset">
        {researcherFields.map((field, index) => {
          const researcher = watch(`members.${index}`);
          const availableRolesToAdd = rolesMap.filter(([roleName]) => !researcher?.roles?.includes(roleName));

          return (
            <div key={field.id} className="item-wrapper">
              <div className={styles["researcher-content"]}>
                <div>
                  <label htmlFor={`researcher-${index}`} className={styles["field-label"]}>
                    Username:
                  </label>
                  <Controller
                    name={`members.${index}.username` as const}
                    control={control}
                    rules={{
                      required: "Username is required",
                      validate: {
                        isNotEmpty: (value) => {
                          if (!value || value.trim() === "") {
                            return "Username is required";
                          }
                          return true;
                        },
                        notEmailPart: (value) => {
                          if (value.includes("@")) {
                            return `Enter only the username part (without ${domainName})`;
                          }
                          return true;
                        },
                        isUnique: (value) => {
                          const allUsernames = getValues("members").map((user) => user.username);
                          const duplicateCount = allUsernames.filter((username) => username === value).length;
                          return duplicateCount <= 1 || "Username has already been entered";
                        },
                      },
                    }}
                    render={({ field: usernameField, fieldState }) => (
                      <div className={styles["username-input-wrapper"]}>
                        <div>
                          <input
                            {...usernameField}
                            id={`researcher-${index}`}
                            type="text"
                            placeholder="ccaxyz"
                            disabled={
                              fieldsDisabled ||
                              editingProject?.members.some((member) => {
                                return member.username === getValues("members")[index].username + domainName;
                              })
                            }
                          />
                          <span className={styles["domain-suffix"]}>{domainName}</span>
                        </div>
                        {fieldState.error && (
                          <Alert type="error">
                            <AlertMessage>{fieldState.error.message}</AlertMessage>
                          </Alert>
                        )}
                      </div>
                    )}
                  />
                </div>

                <div>
                  <label>Roles:</label>
                  <Controller
                    name={`members.${index}.roles` as const}
                    control={control}
                    rules={{
                      validate: {
                        hasAtLeastOneRole: (value) => {
                          if (!value || value.length === 0) {
                            return "At least one role is required";
                          }
                          return true;
                        },
                      },
                    }}
                    render={({ fieldState }) => (
                      <div>
                        {researcher?.roles && researcher.roles.length > 0 && (
                          <div className={styles["role-tags"]}>
                            {researcher.roles.map((role) => (
                              <span key={role} className={styles["role-tag"]}>
                                {roles[role as ProjectTreRoleName].label}
                                <span className={styles["role-tooltip"]}>
                                  <InfoTooltip text={roles[role as ProjectTreRoleName].description} />
                                </span>
                                <button
                                  type="button"
                                  className={styles["role-tag-remove"]}
                                  onClick={() => {
                                    const currentRoles = getValues(`members.${index}.roles`);
                                    setValue(
                                      `members.${index}.roles`,
                                      currentRoles.filter((chosenRole) => chosenRole !== role),
                                      { shouldValidate: true }
                                    );
                                  }}
                                  aria-label={`Remove ${role} role`}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                        {availableRolesToAdd.length > 0 && (
                          <select
                            className={`${styles["role-dropdown"]}`}
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                const currentRoles = getValues(`members.${index}.roles`) || [];
                                setValue(
                                  `members.${index}.roles`,
                                  [...currentRoles, e.target.value as ProjectTreRoleName],
                                  { shouldValidate: true }
                                );
                              }
                            }}
                            disabled={fieldsDisabled}
                          >
                            <option value="">+ Add role...</option>
                            {availableRolesToAdd.map(([roleName, role]) => (
                              <option key={roleName} value={roleName}>
                                {role.label}
                              </option>
                            ))}
                          </select>
                        )}
                        {fieldState.error && (
                          <Alert type="error">
                            <AlertMessage>{fieldState.error.message}</AlertMessage>
                          </Alert>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeResearcher(index)}
                className="remove-button"
                aria-label={`Remove researcher ${index + 1}`}
              >
                ×
              </button>
            </div>
          );
        })}

        <Button
          type="button"
          variant="secondary"
          size="small"
          onClick={() => appendResearcher({ username: "", roles: [] })}
        >
          Add Researcher
        </Button>
      </fieldset>
      <HelperText>Optionally add additional researchers with their roles to this project</HelperText>
    </div>
  );
}

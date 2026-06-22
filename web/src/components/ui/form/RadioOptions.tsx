import { Alert, AlertMessage, Label } from "@/components/shared/uikitExports";
import styles from "./RadioOptions.module.css";
import { FieldPath, FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

export type Option = {
  name: string;
  value: string;
};

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  options: Option[];
};

export default function RadioOptions<T extends FieldValues>(props: Props<T>) {
  const { name, label, options, register, errors } = props;
  const error = errors[name];

  return (
    <div className="field">
      <Label htmlFor={name}>{label}</Label>
      <div className={styles.group}>
        {options.map((option) => {
          return (
            <label className={styles.label} key={option.name}>
              <input
                type="radio"
                value={option.value}
                {...register(name, {
                  required: "Please select an option",
                })}
                className={styles.option}
              />
              {option.name}
            </label>
          );
        })}
      </div>
      {error && (
        <Alert type="error">
          <AlertMessage>{`${error.message}`}</AlertMessage>
        </Alert>
      )}
    </div>
  );
}

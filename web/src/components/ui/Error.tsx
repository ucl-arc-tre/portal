import { Alert, AlertMessage } from "./uikitExports";
import styles from "./Error.module.css";

type Props = {
  message?: string;
};

export default function Error(props: Props) {
  const { message } = props;

  if (!message || message === "") return null;
  return (
    <Alert type="error" className={styles.error}>
      <AlertMessage>{message}</AlertMessage>
    </Alert>
  );
}

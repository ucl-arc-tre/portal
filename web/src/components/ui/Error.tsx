import { Alert, AlertMessage } from "../shared/uikitExports";

type Props = {
  message?: string;
};

export default function Error(props: Props) {
  const { message } = props;

  if (!message) return null;
  return (
    <Alert type="error">
      <AlertMessage>{message}</AlertMessage>
    </Alert>
  );
}

import styles from "./NoObjects.module.css";

type Props = {
  message: string;
  children?: React.ReactNode;
};

export default function NoObjects(props: Props) {
  const { message, children } = props;

  return (
    <div className={styles["no-objects-message"]}>
      <h2>{message}</h2>
      {children}
    </div>
  );
}

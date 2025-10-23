import styles from "./Loading.module.css";

type LoadingProps = {
  message?: string;
  size?: "small" | "medium" | "large";
  loaderOnly?: boolean;
};

export default function Loading({ message = "Loading...", size = "medium", loaderOnly = false }: LoadingProps) {
  return (
    <div className={styles["loading-container"]}>
      <div className={`${styles["loading-spinner"]} ${styles[`spinner-${size}`]}`}></div>
      {!loaderOnly && <p className={styles["loading-message"]}>{message}</p>}
    </div>
  );
}

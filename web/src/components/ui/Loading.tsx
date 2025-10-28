import styles from "./Loading.module.css";

type LoadingProps = {
  message?: string | null;
  size?: "small" | "medium" | "large";
};

export default function Loading({ message = "Loading...", size = "medium" }: LoadingProps) {
  return (
    <div className={styles["loading-container"]}>
      <div className={`${styles["loading-spinner"]} ${styles[`spinner-${size}`]}`}></div>
      {message && <p className={styles["loading-message"]}>{message}</p>}
    </div>
  );
}

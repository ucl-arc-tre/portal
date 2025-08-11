import styles from "./Title.module.css";

type TitleProps = {
  text: string;
  centered?: boolean;
  description?: string;
};

export default function Title(props: TitleProps) {
  return (
    <>
      {" "}
      <h1 className={`${styles.title} ${props.centered ? styles.centered : ""}`}>{props.text}</h1>
      <h4 className={styles.description}>{props.description}</h4>{" "}
    </>
  );
}

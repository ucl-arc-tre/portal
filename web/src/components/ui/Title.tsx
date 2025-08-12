import styles from "./Title.module.css";

type TitleProps = {
  text: string;
  centered?: boolean;
  description?: string;
};

export default function Title(TitleProps: TitleProps) {
  const { text, centered, description } = TitleProps;
  return (
    <>
      {" "}
      <h1 className={`${styles.title} ${centered ? styles.centered : ""}`}>{text}</h1>
      {description && <h4 className={styles.description}>{description}</h4>}
    </>
  );
}

import styles from "./Title.module.css";

type TitleProps = {
  text: string;
  centered?: boolean;
};

export default function Title(props: TitleProps) {
  return <h1 className={`${styles.title} ${props.centered ? styles.centered : ""}`}>{props.text}</h1>;
}

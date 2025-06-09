import styles from "./Title.module.css";

type TitleProps = {
  text: string;
};

export default function Title(props: TitleProps) {
  return <h1 className={styles.title}>{props.text}</h1>;
}

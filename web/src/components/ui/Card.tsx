import { Url } from "next/dist/shared/lib/router/router";
import styles from "./Card.module.css";
import Link from "next/link";

type CardProps = {
  title: string;
  headerContent?: React.ReactNode;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
  actions?: React.ReactNode;
  manageUrl?: Url;
  isWarning?: boolean;
};

export default function Card(props: CardProps) {
  const { headerContent, title, children, footerContent, actions, manageUrl, isWarning } = props;

  const CardInner = (
    <article className={`${styles.card} ${isWarning ? styles.warning : ""}`}>
      <div className={styles.header}>
        <h3>{title}</h3>
        {headerContent}
      </div>
      <div className={styles.content}>{children}</div>

      <div className={styles.footer}>
        {footerContent}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </article>
  );
  return manageUrl ? <Link href={manageUrl}>{CardInner}</Link> : CardInner;
}

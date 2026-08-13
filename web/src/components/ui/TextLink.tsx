import Link from "next/link";
import styles from "./TextLink.module.css";

type Props = React.ComponentProps<typeof Link> & {
  className?: string;
  cy?: string;
};

export default function TextLink({ className, cy, children, ...rest }: Props) {
  return (
    <Link data-cy={cy} className={`${styles.link} ${className || ""}`} {...rest}>
      {children}
    </Link>
  );
}

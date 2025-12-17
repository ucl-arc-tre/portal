import { useRouter } from "next/router";
import styles from "./Breadcrumbs.module.css";
import Button from "./Button";

type BreadCrumbLink = {
  url: string;
  title: string;
};

type BreadcrumbProps = {
  links: Array<BreadCrumbLink>;
};

export default function Breadcrumbs(props: BreadcrumbProps) {
  const numLinks = props.links ? props.links.length : 0;
  const router = useRouter();

  return (
    <div className={styles.breadcrumbs}>
      {props.links &&
        props.links.map((link, index) => (
          <span key={index}>
            <Button
              className={index == numLinks - 1 ? styles.current : undefined}
              onClick={() => router.push(link.url)}
              size="small"
              variant="tertiary"
            >
              {link.title}
            </Button>
            {index < numLinks - 1 && <span> / </span>}
          </span>
        ))}
    </div>
  );
}

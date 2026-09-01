import { useRouter } from "next/router";
import Button from "../ui/Button";
import { AlertCircleIcon, iconSizeSmall } from "../shared/uikitExports";
import styles from "./TabCollection.module.css";

type TabDefinition = {
  name: string;
  label?: string;
  needsAttention?: boolean;
};

type TabCollectionProps = {
  tabs: TabDefinition[];
  defaultTab: string;
};

export default function TabCollection({ tabs, defaultTab }: TabCollectionProps) {
  const router = useRouter();
  const tab = router.query.tab ?? defaultTab;
  const setTab = (newTab: string) =>
    router.push({ query: { ...router.query, tab: newTab } }, undefined, { shallow: true });

  return (
    <div className={styles["tab-collection"]}>
      {tabs.map((tabDefinition) => (
        <Button
          key={tabDefinition.name}
          onClick={() => setTab(tabDefinition.name)}
          variant="secondary"
          className={`${styles.tab} ${tab === tabDefinition.name ? styles.active : ""}`}
          cy={tabDefinition.name}
        >
          {tabDefinition.label ? tabDefinition.label : tabDefinition.name}
          {tabDefinition.needsAttention && (
            <AlertCircleIcon className={styles["needs-attention"]} size={iconSizeSmall} />
          )}
        </Button>
      ))}
    </div>
  );
}

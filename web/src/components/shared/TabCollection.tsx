import { useRouter } from "next/router";
import Button from "../ui/Button";
import { AlertCircleIcon } from "../shared/uikitExports";
import styles from "./TabCollection.module.css";

type StudyTabNames = "study" | "assets" | "contracts";
type ProjectTabNames = "project" | "members" | "assets";
type TabName = StudyTabNames | ProjectTabNames | "pending" | "all";

type TabDefinition = {
  name: TabName;
  label?: string;
  needsAttention?: boolean;
};

type TabCollectionProps = {
  tabs: TabDefinition[];
};

export default function TabCollection({ tabs }: TabCollectionProps) {
  const router = useRouter();
  const tab: TabName = (router.query.tab as TabName | undefined) ?? tabs[0]?.name ?? "study";
  const setTab = (newTab: TabName) =>
    router.push({ query: { ...router.query, tab: newTab } }, undefined, { shallow: true });

  return (
    <div className={styles["tab-collection"]}>
      {tabs.map((tabDefinition) => (
        <Button
          key={tabDefinition.name}
          onClick={() => setTab(tabDefinition.name)}
          variant="secondary"
          className={`${styles.tab} ${tab === tabDefinition.name ? "active" : ""}`}
          cy={tabDefinition.name}
        >
          {tabDefinition.label ? tabDefinition.label : tabDefinition.name}
          {tabDefinition.needsAttention && <AlertCircleIcon className={styles["needs-attention"]} />}
        </Button>
      ))}
    </div>
  );
}

import { useRouter } from "next/router";
import { AlertCircleIcon, iconSizeSmall } from "./uikitExports";
import styles from "./TabCollection.module.css";
import dynamic from "next/dist/shared/lib/dynamic";

type TabDefinition = {
  name: string;
  label?: string;
  needsAttention?: boolean;
};

type TabCollectionProps = {
  tabs: TabDefinition[];
  defaultTab: string;
};

const Tabs = dynamic(() => import("uikit-react-public").then((mod) => mod.Tabs), {
  ssr: false,
});
const Tab = dynamic(() => import("uikit-react-public").then((mod) => mod.Tabs.Tab), {
  ssr: false,
});

export default function TabCollection({ tabs, defaultTab }: TabCollectionProps) {
  const router = useRouter();
  const setTab = (newTab: string) =>
    router.push({ query: { ...router.query, tab: newTab } }, undefined, { shallow: true });

  return (
    <Tabs defaultValue={defaultTab} onValueChange={setTab}>
      {tabs.map((tabDefinition) => (
        <Tab key={tabDefinition.name} value={tabDefinition.name} data-cy={tabDefinition.name} className={styles.tab}>
          {tabDefinition.label ? tabDefinition.label : tabDefinition.name}
          {tabDefinition.needsAttention && (
            <AlertCircleIcon className={styles["needs-attention"]} size={iconSizeSmall} />
          )}
        </Tab>
      ))}
    </Tabs>
  );
}

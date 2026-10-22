import { useRouter } from "next/router";
import { AlertCircleIcon, iconSizeSmall } from "./uikitExports";
import styles from "./TabCollection.module.css";
import dynamic from "next/dist/shared/lib/dynamic";
import Badge from "./Badge";

type TabItem = {
  name: string;
  label?: string;
  needsAttention?: boolean;
  count?: number;
};

type TabCollectionProps = {
  tabs: TabItem[];
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
    <Tabs defaultValue={defaultTab} onValueChange={setTab} className={styles["tab-collection"]}>
      {tabs.map((tabItem) => (
        <Tab key={tabItem.name} value={tabItem.name} data-cy={tabItem.name} className={styles.tab}>
          {tabItem.label ? tabItem.label : tabItem.name}
          {tabItem.count !== undefined && (
            <Badge cy="tab-count" className={styles.count}>
              {tabItem.count}
            </Badge>
          )}
          {tabItem.needsAttention && <AlertCircleIcon className={styles["needs-attention"]} size={iconSizeSmall} />}
        </Tab>
      ))}
    </Tabs>
  );
}

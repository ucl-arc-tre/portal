import { useAuth } from "@/hooks/useAuth";

import MetaHead from "@/components/meta/Head";
import LoginFallback from "@/components/ui/LoginFallback";
import Callout from "@/components/ui/Callout";
import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { HelperText } from "@/components/ui/uikitExports";
import { ContractDefinition } from "@/components/shared/entityDefinitions";
import styles from "./ContractsPage.module.css";

export default function ContractsPage() {
  const { authInProgress, isAuthed, canSeeAllStudies } = useAuth();
  const [infoCalloutExpanded, setInfoCalloutExpanded] = useState(false);

  if (authInProgress) return null;
  if (!isAuthed) return <LoginFallback />;

  return (
    <>
      <MetaHead title="Contracts | ARC Services Portal" description="Search contracts in the ARC Services Portal" />

      <div className={styles.container}>
        <PageHeader
          title={canSeeAllStudies ? "All Contracts" : "Your Contracts"}
          info={{
            label: "Toggle contract definition",
            expanded: infoCalloutExpanded,
            onToggle: () => setInfoCalloutExpanded(!infoCalloutExpanded),
          }}
        />

        {infoCalloutExpanded && <ContractDefinition />}
        <Callout construction />

        <HelperText>Search contracts you have access to across all studies.</HelperText>
      </div>
    </>
  );
}

import { useAuth } from "@/hooks/useAuth";

import MetaHead from "@/components/meta/Head";
import LoginFallback from "@/components/ui/LoginFallback";
import Callout from "@/components/ui/Callout";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Line from "@/components/ui/Line";
import { HelperText, InfoIcon } from "@/components/ui/uikitExports";
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
        <div className={styles.header}>
          <h2>
            {canSeeAllStudies ? "All Contracts " : "Your Contracts "}
            <Button
              onClick={() => setInfoCalloutExpanded(!infoCalloutExpanded)}
              variant="tertiary"
              size="small"
              inline
              aria-label="Toggle contract definition"
            >
              <InfoIcon />
            </Button>
          </h2>
        </div>
        <Line />

        {infoCalloutExpanded && <ContractDefinition />}
        <Callout construction />

        <HelperText>Search contracts you have access to across all studies.</HelperText>
      </div>
    </>
  );
}

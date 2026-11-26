import { Contract } from "@/openapi";
import ContractCard from "./ContractCard";
import styles from "./ContractResultsList.module.css";

type Props = {
  contracts: Contract[];
};

export default function ContractResultsList(props: Props) {
  const { contracts } = props;

  return (
    <div className={styles["contract-selection"]}>
      <div className={styles["contract-list"]}>
        {contracts.map((contract) => (
          <ContractCard key={contract.id} contract={contract} studyId={contract.study_id} />
        ))}
      </div>
    </div>
  );
}

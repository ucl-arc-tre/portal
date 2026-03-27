import { useRouter } from "next/router";
import { Study } from "@/openapi";
import StatusBadge from "../ui/StatusBadge";
import Button from "@/components/ui/Button";

import styles from "./StudyCardsList.module.css";

import dynamic from "next/dynamic";
import { useState } from "react";
const PaginationControls = dynamic(() => import("uikit-react-public").then((mod) => mod.Pagination.Controls), {
  ssr: false,
});
const PaginationInfo = dynamic(() => import("uikit-react-public").then((mod) => mod.Pagination.Info), {
  ssr: false,
});
const Pagination = dynamic(() => import("uikit-react-public").then((mod) => mod.Pagination), {
  ssr: false,
});

type Props = {
  studies: Study[];
};

const studySortOrder = {
  Pending: 1,
  Incomplete: 2,
  Rejected: 3,
  Approved: 4,
};

export default function StudyCardsList(props: Props) {
  const { studies } = props;
  const router = useRouter();

  const limit = 10;
  const [offset, setOffset] = useState(0);

  return (
    <div className={styles["study-selection"]}>
      <div className={styles["studies-list"]}>
        {studies
          .slice()
          .sort((a, b) => studySortOrder[a.approval_status] - studySortOrder[b.approval_status])
          .slice(offset, offset + limit)
          .map((study) => (
            <div key={study.id} className={styles["study-card"]} data-cy="study-card">
              <div className={styles["status-indicator"]}>
                <StatusBadge status={study.approval_status} type="study" />
              </div>

              <div className={styles["study-info"]}>
                <h3 className={styles["study-title"]}>{study.title}</h3>
                <span className={styles["study-caseref"]}>Case ref: {String(study.caseref).padStart(5, "0")}</span>
                <p className={styles["study-description"]}>{study.description}</p>
              </div>

              <div className={styles["study-actions"]}>
                <Button
                  onClick={() => router.push(`/studies/manage?studyId=${study.id}`)}
                  size="small"
                  data-cy="manage-study-button"
                >
                  Manage Study
                </Button>
              </div>
            </div>
          ))}
      </div>
      {studies.length > 10 && (
        <div className={styles["pagination-container"]}>
          <Pagination
            total={studies.length}
            limit={limit}
            offset={offset}
            onPageChange={(newOffset) => setOffset(newOffset)}
          >
            <PaginationControls />
            <PaginationInfo />
          </Pagination>
          {studies.length == 50 && <small>Please note these results have been limited to 50 items</small>}
        </div>
      )}
    </div>
  );
}

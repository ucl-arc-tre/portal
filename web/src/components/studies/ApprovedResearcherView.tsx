import { useState } from "react";
import Button from "../ui/Button";
import styles from "./ApprovedResearcherView.module.css";
import CreateStudyForm from "./CreateStudyForm";

type ApprovedResearcherViewProps = {
  username: string;
};
export default function ApprovedResearcherView(props: ApprovedResearcherViewProps) {
  const { username } = props;
  const [createStudyFormOpen, setCreateStudyFormOpen] = useState(false);
  const handleCreateStudyClick = () => {
    setCreateStudyFormOpen(true);
  };
  return (
    <>
      {createStudyFormOpen && <CreateStudyForm username={username} setCreateStudyFormOpen={setCreateStudyFormOpen} />}

      <h2 className={styles["content-heading"]}>Your Studies</h2>
      <div className={styles["content-wrapper"]}>
        <div className={styles["create-study-container"]}>
          {/* if IsUCLStaff && */}
          <Button onClick={handleCreateStudyClick} size="small" className={styles["create-study-button"]}>
            Create Study
          </Button>
        </div>
        <div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>View full details</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    </>
  );
}

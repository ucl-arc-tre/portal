import { useState } from "react";
import Button from "../ui/Button";
import styles from "./ApprovedResearcherView.module.css";
import CreateStudyForm from "./CreateStudyForm";

export default function ApprovedResearcherView() {
  const [createStudyFormOpen, setCreateStudyFormOpen] = useState(false);
  const handleCreateStudyClick = () => {
    console.log("Create study");
    setCreateStudyFormOpen(true);
  };
  return (
    <>
      {createStudyFormOpen && <CreateStudyForm username={"username"} setCreateStudyFormOpen={setCreateStudyFormOpen} />}

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
                <th>Study Name</th>
                <th>Study Description</th>
                <th>Study Status</th>
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

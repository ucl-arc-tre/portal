import { useState } from "react";
import Button from "../ui/Button";
import StudySelection from "../studies/StudySelection";
import CreateStudyForm from "./CreateStudyForm";

import styles from "./ApprovedResearcherView.module.css";

type Props = {
  username: string;
  studies: Study[];
};

export default function Studies(props: Props) {
  const { username, studies } = props;
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);
  const [createStudyFormOpen, setCreateStudyFormOpen] = useState(false);

  const handleCreateStudyClick = () => {
    setCreateStudyFormOpen(true);
  };

  if (!selectedStudy) {
    return (
      <>
        <Button onClick={handleCreateStudyClick} size="small" className={styles["create-study-button"]}>
          Create Study
        </Button>

        <StudySelection studies={studies} setSelectedStudy={setSelectedStudy} />
      </>
    );
  }

  return (
    <>
      {createStudyFormOpen && <CreateStudyForm username={username} setCreateStudyFormOpen={setCreateStudyFormOpen} />}

      <h2 className={styles["content-heading"]}>Your Studies</h2>

      <div className={styles["content-wrapper"]}>
        <div className={styles["create-study-container"]}>
          <Button onClick={handleCreateStudyClick} size="small" className={styles["create-study-button"]}>
            Create Study
          </Button>
        </div>
        Studies
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

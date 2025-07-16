import { useState } from "react";
import StudySelection from "../studies/StudySelection";
import CreateStudyForm from "./CreateStudyForm";
import { Button } from "uikit-react-public";

import styles from "./Studies.module.css";

type Props = {
  username: string;
  studies: Study[];
};

export default function Studies(props: Props) {
  const { username, studies } = props;
  const [createStudyFormOpen, setCreateStudyFormOpen] = useState(false);

  const handleCreateStudyClick = () => {
    setCreateStudyFormOpen(true);
  };

  const handleStudySelect = (study: Study) => {
    // TODO: Navigate to study detail page or show study-specific content
    console.log("Selected study:", study);
  };

  return (
    <>
      {createStudyFormOpen && <CreateStudyForm username={username} setCreateStudyFormOpen={setCreateStudyFormOpen} />}

      {studies.length === 0 ? (
        <div className={styles["no-studies-message"]}>
          <p>You haven&apos;t created any studies yet. Click the button below to create your first study.</p>

          <Button onClick={handleCreateStudyClick} size="large">
            Create Your First Study
          </Button>
        </div>
      ) : (
        <>
          <div className={styles["create-study-section"]}>
            <Button onClick={handleCreateStudyClick} size="large">
              Create New Study
            </Button>
          </div>

          <StudySelection studies={studies} handleStudySelect={handleStudySelect} />
        </>
      )}
    </>
  );
}

import Button from "../ui/Button";

export default function ApprovedResearcherView() {
  return (
    <>
      <h2>Your Studies</h2>
      <div>
        <div>
          <Button>Create Study</Button>
        </div>
        <div>
          <table>
            <thead>
              <th>Study Name</th>
              <th>Study Description</th>
              <th>Study Status</th>
              <th>View full details</th>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    </>
  );
}

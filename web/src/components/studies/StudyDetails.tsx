import { Study } from "@/openapi";

type StudyDetailsProps = {
  study: Study;
};
export default function StudyDetails({ study }: StudyDetailsProps) {
  return (
    <>
      <div>Study Details</div>;
    </>
  );
}

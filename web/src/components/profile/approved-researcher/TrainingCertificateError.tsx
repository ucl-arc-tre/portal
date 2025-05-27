type TrainingCertificateErrorProps = {
  text: string;
};

const manualApprovalEmailAddress = "ig-training@ucl.ac.uk";
const manualApprovalEmailBody = encodeURI("Dear UCL Information Governance,\n\n ...");
const manualApprovalEmailSubject = "Training certificate";

export default function TrainingCertificateError(props: TrainingCertificateErrorProps) {
  return (
    <p>
      {props.text}
      {" If required, please email your certificate to "}
      <a
        href={`mailto:${manualApprovalEmailAddress}?body=${manualApprovalEmailBody}&subject=${manualApprovalEmailSubject}`}
      >
        {manualApprovalEmailAddress}
      </a>
      {" for manual approval."}
    </p>
  );
}

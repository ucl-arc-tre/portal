type TrainingCertificateErrorProps = {
  text: string;
};

const manualApprovalEmailBody = encodeURI("Dear UCL Information Governance,\n\n ...");

const manualApprovalEmailSubject = "Training certificate";

export default function TrainingCertificateError(props: TrainingCertificateErrorProps) {
  return (
    <p>
      {props.text}
      {" If required, please email your certificate to "}
      <a href={`mailto:ig-training@ucl.ac.uk?body=${manualApprovalEmailBody}&subject=${manualApprovalEmailSubject}`}>
        ig-training@ucl.ac.uk
      </a>
      {" for manual approval."}
    </p>
  );
}

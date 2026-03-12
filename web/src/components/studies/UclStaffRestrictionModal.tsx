import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";

type Props = {
  setOpen: (open: boolean) => void;
};

export default function UclStaffRestrictionModal({ setOpen }: Props) {
  return (
    <Dialog setDialogOpen={setOpen} cy="ucl-staff-restriction-modal">
      <h2>UCL Staff Only</h2>
      <p>Only UCL staff members can create studies.</p>
      <p>If you believe this is an error, please contact your administrator.</p>
      <div style={{ marginTop: "1.5rem" }}>
        <Button onClick={() => setOpen(false)} variant="secondary">
          Close
        </Button>
      </div>
    </Dialog>
  );
}

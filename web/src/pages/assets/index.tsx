import Assets from "@/components/assets/Assets";
import MetaHead from "@/components/meta/Head";

export default function StudiesPage() {
  return (
    <>
      <MetaHead
        title="Assets | ARC Services Portal"
        description="View and modify data assets in the ARC Services Portal"
      />
      <div>
        <Assets />
      </div>
    </>
  );
}

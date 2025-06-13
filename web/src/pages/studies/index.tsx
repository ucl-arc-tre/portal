import MetaHead from "@/components/meta/Head";
import Studies from "@/components/studies/Studies";

export default function StudiesPage() {
  return (
    <>
      <MetaHead
        title="Studies | ARC Services Portal"
        description="View and modify studies in the ARC Services Portal"
      />
      <div>
        <Studies />
      </div>
    </>
  );
}

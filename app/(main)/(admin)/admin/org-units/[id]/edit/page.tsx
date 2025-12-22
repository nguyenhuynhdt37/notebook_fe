import OrgUnitEdit from "@/components/admin/org-units/org-unit-edit";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrgUnitEditPage({ params }: PageProps) {
  const { id } = await params;
  return <OrgUnitEdit orgUnitId={id} />;
}

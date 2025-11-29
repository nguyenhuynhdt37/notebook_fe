import UserEdit from "@/components/admin/users/user-edit";

interface UserEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserEditPage({ params }: UserEditPageProps) {
  const { id } = await params;
  return <UserEdit userId={id} />;
}

import UserDetail from "@/components/admin/users/user-detail";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;
  return <UserDetail userId={id} />;
}

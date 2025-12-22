import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getServerCookie } from "@/api/server/cookieStore";
import NotebookWorkspace from "@/components/users/notebook/workspace";

interface NotebookWorkspacePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: NotebookWorkspacePageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Workspace - Nhóm cộng đồng`,
    description: "Chat và tương tác với nhóm cộng đồng trên EduGenius.",
  };
}

export default async function NotebookWorkspacePage({
  params,
}: NotebookWorkspacePageProps) {
  const { id } = await params;
  const stores = await cookies();
  const accessToken = getServerCookie(stores, "AUTH-TOKEN");

  return (
    <NotebookWorkspace notebookId={id} accessToken={accessToken || undefined} />
  );
}

import type { Metadata } from "next";
import NotebookWorkspace from "@/components/user/notebook/workspace";

interface NotebookWorkspacePageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({
    params,
}: NotebookWorkspacePageProps): Promise<Metadata> {
    const { id } = await params;
    return {
        title: `Workspace - Nhóm cộng đồng`,
        description: "Chat và tương tác với nhóm cộng đồng trên Notebooks AI.",
    };
}

export default async function NotebookWorkspacePage({
    params,
}: NotebookWorkspacePageProps) {
    const { id } = await params;
    return <NotebookWorkspace notebookId={id} />;
}


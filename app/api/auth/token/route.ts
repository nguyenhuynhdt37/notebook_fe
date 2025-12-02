import { cookies } from "next/headers";
import { getServerCookie } from "@/api/server/cookieStore";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = getServerCookie(cookieStore, "AUTH-TOKEN");

        if (!token) {
            return NextResponse.json(
                { error: "Token not found" },
                { status: 401 }
            );
        }

        return NextResponse.json({ token });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to get token" },
            { status: 500 }
        );
    }
}


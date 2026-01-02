import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Update the user's publicMetadata to set profileExists to true
    // updateUserMetadata performs a deep merge with existing metadata
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        profileExists: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user metadata:", error);
    return NextResponse.json(
      { error: "Failed to update user metadata" },
      { status: 500 }
    );
  }
}

import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClerkSupabaseClientSsr } from "../../../utils/supabase/server";
import { type } from "os";

export async function POST(req) {

  // ensuring user is authenticated
  const authData = await auth().catch(() => null);
  const userId = authData?.userId;

  if (!userId) {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      { status: 401 },
    );
  }

  const user = await currentUser();
  const supabase = await createClerkSupabaseClientSsr();
  const body = await req.json();

  // upserting user and their interests to supabase
  try {
    const { error: upsertError } = await supabase
    .from("users")
    .upsert({
      id: userId,
      first_name: user.firstName,
      last_name: user.lastName,
      initial: user.firstName && user.lastName ? user.firstName.charAt(0) + user.lastName.charAt(0) : null,
      interests: body.interests, // getting the array of interests from the json
    });

    if (upsertError) {
      return NextResponse.json(
        {
          message: upsertError,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: "Upload succeeded",
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      {
        message: upsertError,
      },
      { status: 500 },
    );
  }
}
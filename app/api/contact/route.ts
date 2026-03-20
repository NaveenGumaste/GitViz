import { NextRequest, NextResponse } from "next/server";
import { ContactFormSchema } from "@/lib/schemas/contact";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body: unknown = await request.json();
  const parsed = ContactFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please fill out the contact form correctly.",
        code: "validation_error",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    message: "Your message has been received.",
  });
}

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");
    if (!reference)
      return NextResponse.json(
        { error: "reference required" },
        { status: 400 },
      );

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret)
      return NextResponse.json(
        { error: "Paystack secret not configured" },
        { status: 500 },
      );

    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${secret}`,
        },
      },
    );

    const data = await res.json();
    if (!res.ok)
      return NextResponse.json(
        { error: data.message || "Paystack verify failed" },
        { status: res.status },
      );

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}

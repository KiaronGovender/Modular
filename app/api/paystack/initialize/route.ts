import { NextResponse } from "next/server";

type InitRequest = {
  email: string;
  amount: number; // in smallest currency unit (e.g., kobo/cents)
  reference?: string;
  metadata?: Record<string, unknown>;
  callback_url?: string;
  currency?: string;
};

export async function POST(req: Request) {
  try {
    const body: InitRequest = await req.json();

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        { error: "Paystack secret not configured" },
        { status: 500 },
      );
    }

    const currency = body.currency || process.env.PAYSTACK_CURRENCY || "NGN";

    const payload: Record<string, unknown> = {
      email: body.email,
      amount: body.amount,
      currency,
      // include callback_url when provided so Paystack can redirect the user
      // back to the app after payment completion
      ...(body.callback_url ? { callback_url: body.callback_url } : {}),
      reference: body.reference,
      metadata: body.metadata || {},
    };

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok)
      return NextResponse.json(
        { error: data.message || "Paystack init failed" },
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

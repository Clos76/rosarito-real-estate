// /app/api/csp-report/route.ts (Next.js 13+)
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const report = await req.json();
    console.log("CSP Report:", report);
    // You can store it somewhere or just log it
    return NextResponse.json({ received: true });
}

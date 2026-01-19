import { NextResponse } from "next/server";

export async function POST(req) {
    const formData = await req.formData();
    console.log(formData);
}
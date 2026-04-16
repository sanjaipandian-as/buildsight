import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function err(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ success: false, error: message, ...(details ? { details } : {}) }, { status });
}

export function handleError(error: unknown) {
  if (error instanceof ZodError) {
    return err("Validation failed", 422, error.flatten().fieldErrors);
  }
  console.error("[API Error]", error);
  return err("Internal server error", 500);
}

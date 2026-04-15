import { NextResponse } from "next/server";

import { HttpError, toHttpError } from "./errors";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(error: unknown) {
  const normalized = toHttpError(error);

  return NextResponse.json(
    {
      message: normalized.message,
      code: normalized.code,
      details: normalized.details,
    },
    { status: normalized.status },
  );
}

export function assert(condition: unknown, error: HttpError): asserts condition {
  if (!condition) {
    throw error;
  }
}

import { ApiError, isApiError } from "@scheduler/api";
import { NextResponse } from "next/server";

export function success<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function successNoData(init?: ResponseInit) {
  return NextResponse.json({ success: true }, init);
}

export function handleError(error: unknown) {
  if (isApiError(error)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    console.error(error);
  } else {
    console.error("Unhandled error", error);
  }
  return NextResponse.json(
    {
      success: false,
      error: {
        message: "Internal Server Error",
      },
    },
    { status: 500 }
  );
}

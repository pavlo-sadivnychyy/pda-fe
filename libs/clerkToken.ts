"use client";

let getTokenFn: null | (() => Promise<string | null>) = null;

export function setClerkGetToken(fn: () => Promise<string | null>) {
  getTokenFn = fn;
}

export async function getClerkToken() {
  return getTokenFn ? await getTokenFn() : null;
}

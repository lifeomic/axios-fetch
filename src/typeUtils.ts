import { Headers as NodeHeaders } from 'node-fetch';

export type HeadersLike = string[][] | Record<string, string | undefined> | Headers | NodeHeaders;

export type UrlLike = string | {
  href?: string;
  url?: string;
}

export function createFetchHeaders (axiosHeaders: Record<string, string> = {}): string[][] {
  const headers: string[][] = [];
  Object.entries(axiosHeaders).forEach(([name, value]) => {
    headers.push([name, value]);
  });
  return headers;
}

const isHeaders = (headers: HeadersLike): headers is Headers => headers.constructor?.name === 'Headers';

export function createAxiosHeaders (headers: HeadersLike = {}): Record<string, string> {
  const rawHeaders: Record<string, string> = {};

  if (isHeaders(headers)) {
    headers.forEach((value, name) => {
      rawHeaders[name] = value;
    });
  } else if (Array.isArray(headers)) {
    headers.forEach(([name, value]) => {
      if (value) {
        rawHeaders[name!] = value;
      }
    });
  } else {
    Object.entries(headers).forEach(([name, value]) => {
      if (value) {
        rawHeaders[name] = value;
      }
    });
  }
  return rawHeaders;
}

export function getUrl (input?: UrlLike): string | undefined {
  let url: string | undefined;
  if (typeof input === 'string') {
    url = input;
  } else if (input?.href) {
    url = input.href;
  } else if (input?.url) {
    url = input.url;
  }
  return url;
}

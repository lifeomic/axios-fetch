import { Headers, HeadersInit, Request, RequestInfo } from 'node-fetch';

export function createFetchHeaders (axiosHeaders: Record<string, string> = {}): Headers {
  const headers = new Headers();
  Object.entries(axiosHeaders).forEach(([key, value]) => {
    const values = value.split(/, */);
    values.forEach((value) => headers.append(key, value));
  });
  return headers;
}

export function createAxiosHeaders (headers: HeadersInit = {}): Record<string, string> {
  const rawHeaders: Record<string, string> = {};

  if (headers instanceof Headers) {
    const headersRaw = headers.raw();
    Object.entries(headersRaw).forEach(([key, value]) => {
      rawHeaders[key] = value.join(', ');
    });
  } else if (Array.isArray(headers)) {
    headers.forEach(([name, ...values]) => {
      rawHeaders[name!] = values.join(', ');
    });
  } else {
    Object.assign(rawHeaders, headers);
  }
  return rawHeaders;
}

export function getUrl (input?: RequestInfo): string | undefined {
  let url: string | undefined;
  if (typeof input === 'string') {
    url = input;
  } else if (input && 'href' in input) {
    url = input.href;
  } else if (input instanceof Request) {
    url = input.url;
  }
  return url;
}

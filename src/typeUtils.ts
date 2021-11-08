import { Headers, HeadersInit, Request, RequestInfo } from 'node-fetch';

export function createFetchHeaders (axiosHeaders: Record<string, string> = {}): Headers {
  const headers = new Headers();
  Object.keys(axiosHeaders).forEach((name) => {
    const values = axiosHeaders[name]?.split(/, */);
    values?.forEach((value) => headers.append(name, value));
  });
  return headers;
}

export function createAxiosHeaders (headers: HeadersInit = {}): Record<string, string> {
  const rawHeaders: Record<string, string> = {};

  if (headers instanceof Headers) {
    const headersRaw = headers.raw();
    for (const name of headers.keys()) {
      const value = headersRaw[name];
      if (value) {
        rawHeaders[name] = value.join(', ');
      }
    }
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

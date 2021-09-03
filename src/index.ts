import { Response, Headers as FetchHeaders } from 'node-fetch';
import FormData from 'form-data';
import { AxiosInstance, AxiosRequestConfig } from './types';

export interface FetchInit extends Record<string, any> {
  headers?: Record<string, string>;
  method?: AxiosRequestConfig['method'];
  body?: FormData | any;
  extra?: any;
}

export type AxiosTransformer = (config: AxiosRequestConfig, input: string | undefined, init: FetchInit) => AxiosRequestConfig;

export type AxiosFetch = (input?: string, init?: FetchInit) => Promise<Response>;

/**
 * A Fetch WebAPI implementation based on the Axios client
 */
async function axiosFetch (
  axios: AxiosInstance,
  // Convert the `fetch` style arguments into a Axios style config
  transformer?: AxiosTransformer,
  input?: string,
  init: FetchInit = {}
) {
  const rawHeaders: Record<string, string> = init.headers || {};
  const lowerCasedHeaders = Object.keys(rawHeaders)
    .reduce<Record<string, string>>(
      (acc, key) => {
        acc[key.toLowerCase()] = rawHeaders[key] || '';
        return acc;
      },
      {}
    );

  if (!('content-type' in lowerCasedHeaders)) {
    lowerCasedHeaders['content-type'] = 'text/plain;charset=UTF-8';
  }

  const rawConfig: AxiosRequestConfig = {
    url: input,
    method: init.method || 'GET',
    data: typeof init.body === 'undefined' || init.body instanceof FormData ? init.body : String(init.body),
    headers: lowerCasedHeaders,
    // Force the response to an arraybuffer type. Without this, the Response
    // object will try to guess the content type and add headers that weren't in
    // the response.
    // NOTE: Don't use 'stream' because it's not supported in the browser
    responseType: 'arraybuffer'
  };

  const config = transformer ? transformer(rawConfig, input, init) : rawConfig;

  let result;
  try {
    result = await axios.request(config);
  } catch (err) {
    if (err.response) {
      result = err.response;
    } else {
      throw err;
    }
  }

  const fetchHeaders = new FetchHeaders(result.headers);

  return new Response(result.data, {
    status: result.status,
    statusText: result.statusText,
    headers: fetchHeaders
  });
}

export function buildAxiosFetch (axios: AxiosInstance, transformer?: AxiosTransformer): AxiosFetch {
  return axiosFetch.bind(undefined, axios, transformer);
}

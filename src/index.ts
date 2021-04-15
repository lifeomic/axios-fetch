import { Response, Headers } from 'node-fetch';
import mapKeys from 'lodash.mapkeys';
import identity from 'lodash.identity';
import FormData from 'form-data';
import { AxiosInstance, AxiosRequestConfig } from './types';

export interface FetchInit extends Record<string, any> {
  headers?: Record<string, string>;
  method?: AxiosRequestConfig['method'];
  body?: FormData | any;
  extra?: any;
}

type AxiosTransformer = (config: AxiosRequestConfig, input: string | undefined, init: FetchInit) => AxiosRequestConfig;

type AxiosFetch = (input?: string, init?: FetchInit) => Response;

const defaultTransformer = identity as AxiosTransformer;

/**
 * A Fetch WebAPI implementation based on the Axios client
 */
async function axiosFetch (
  axios: AxiosInstance,
  // Convert the `fetch` style arguments into a Axios style config
  transformer: AxiosTransformer = defaultTransformer,
  input?: string,
  init: FetchInit = {}
) {
  const lowerCasedHeaders = mapKeys(init.headers, (value, key) => key.toLowerCase());

  if (!('content-type' in lowerCasedHeaders)) {
    lowerCasedHeaders['content-type'] = 'text/plain;charset=UTF-8';
  }

  const config = transformer({
    url: input,
    method: init.method || 'GET',
    data: typeof init.body === 'undefined' || init.body instanceof FormData ? init.body : String(init.body),
    headers: lowerCasedHeaders,
    // Force the response to an arraybuffer type. Without this, the Response
    // object will try to guess the content type and add headers that weren't in
    // the response.
    // NOTE: Don't use 'stream' because it's not supported in the browser
    responseType: 'arraybuffer'
  }, input, init);

  let result;
  try {
    result = await axios.request(config);
  } catch (err) {
    result = err.response;
  }

  const headers = new Headers(result.headers);

  return new Response(result.data, {
    status: result.status,
    statusText: result.statusText,
    headers
  });
}

export function buildAxiosFetch (axios: AxiosInstance, transformer?: AxiosTransformer): AxiosFetch {
  return axiosFetch.bind(undefined, axios, transformer);
}

import { Response, Request, Headers as FetchHeaders, RequestInfo, RequestInit } from 'node-fetch';
import { AxiosInstance, AxiosRequestConfig } from './types';
import FormData from 'form-data';

export type AxiosTransformer = (config: AxiosRequestConfig, input: RequestInfo, init?: RequestInit) => AxiosRequestConfig;

export type AxiosFetch = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

/**
 * A Fetch WebAPI implementation based on the Axios client
 *
 * @param axios
 * @param transformer Convert the `fetch` style arguments into a Axios style config
 * @param input
 * @param init
 */
async function axiosFetch (
  axios: AxiosInstance,
  transformer: AxiosTransformer | undefined,
  input: RequestInfo,
  init?: RequestInit
) {
  // Request class handles for us all the input normalisation
  const request = new Request(input, init);
  const lowerCasedHeaders: Record<string, string> = {};

  for (const entry of request.headers.entries()) {
    lowerCasedHeaders[entry[0].toLowerCase()] = entry[1];
  }

  if (!('content-type' in lowerCasedHeaders)) {
    lowerCasedHeaders['content-type'] = 'text/plain;charset=UTF-8';
  }

  const data = init?.body instanceof FormData ? init?.body : await request.arrayBuffer();

  const rawConfig: AxiosRequestConfig = {
    url: request.url,
    method: (request.method || 'GET') as AxiosRequestConfig['method'],
    data: data,
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

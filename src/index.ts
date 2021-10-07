import { Response, RequestInit, RequestInfo } from 'node-fetch';
import { AxiosInstance, AxiosRequestConfig, AxiosError } from './types';
import { createFetchHeaders, createAxiosHeaders, getUrl } from './typeUtils';

export interface FetchInit extends Omit<RequestInit, 'body'> {
  method?: string | AxiosRequestConfig['method'];
  body?: RequestInit['body'] | Record<string, any>;
  extra?: any;
}

export type AxiosTransformer = (
  config: AxiosRequestConfig,
  input?: RequestInfo,
  init?: FetchInit,
) => AxiosRequestConfig;

export type AxiosFetch = (input?: RequestInfo, init?: FetchInit) => Promise<Response>;

/**
 * A Fetch WebAPI implementation based on the Axios client
 */
const axiosFetch: (axios: AxiosInstance, transformer?: AxiosTransformer) => AxiosFetch = (
  axios,
  transformer = (config) => config,
) => async (
  input,
  init= {},
) => {
  const rawHeaders: Record<string, string> = createAxiosHeaders(init.headers);
  const lowerCasedHeaders = Object.keys(rawHeaders)
    .reduce<Record<string, string>>(
      (acc, key) => {
        acc[key.toLowerCase()] = rawHeaders[key];
        return acc;
      },
      {},
    );

  if (!('content-type' in lowerCasedHeaders)) {
    lowerCasedHeaders['content-type'] = 'text/plain;charset=UTF-8';
  }

  const rawConfig: AxiosRequestConfig = {
    url: getUrl(input),
    method: (init.method as AxiosRequestConfig['method']) || 'GET',
    data: init.body,
    headers: lowerCasedHeaders,
    // Force the response to an arraybuffer type. Without this, the Response
    // object will try to guess the content type and add headers that weren't in
    // the response.
    // NOTE: Don't use 'stream' because it's not supported in the browser
    responseType: 'arraybuffer',
  };

  const config = transformer(rawConfig, input, init);

  let result;
  try {
    result = await axios.request(config);
  } catch (err: any | AxiosError) {
    if ('response' in err) {
      result = (err as AxiosError).response;
    } else {
      throw err;
    }
  }

  return new Response(result.data, {
    status: result.status,
    statusText: result.statusText,
    headers: createFetchHeaders(result.headers),
  });
};

export function buildAxiosFetch (axios: AxiosInstance, transformer?: AxiosTransformer): AxiosFetch {
  return axiosFetch(axios, transformer);
}

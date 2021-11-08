import { Response, RequestInfo, RequestInit } from 'node-fetch';
import { AxiosInstance, AxiosRequestConfig } from './types';
import { createAxiosHeaders, createFetchHeaders, getUrl } from './typeUtils';

export type AxiosTransformer<Init extends RequestInit = RequestInit> = (config: AxiosRequestConfig, input: RequestInfo, init?: Init) => AxiosRequestConfig;

/**
 * A Fetch WebAPI implementation based on the Axios client
 */
const axiosFetch = <Init extends RequestInit = RequestInit>(
  axios: AxiosInstance,
  // Convert the `fetch` style arguments into a Axios style config
  transformer: AxiosTransformer<Init> = (config) => config
) => async (
    input: RequestInfo,
    init?: Init
  ) => {
    const rawHeaders: Record<string, string | undefined> = createAxiosHeaders(init?.headers);
    const lowerCasedHeaders = Object.keys(rawHeaders).filter(key => key && rawHeaders[key])
      .reduce<Record<string, string | undefined>>(
        (acc, key) => {
          acc[key.toLowerCase()] = rawHeaders[key];
          return acc;
        },
        {}
      );

    if (!('content-type' in lowerCasedHeaders)) {
      lowerCasedHeaders['content-type'] = 'text/plain;charset=UTF-8';
    }

    const rawConfig: AxiosRequestConfig = {
      url: getUrl(input),
      method: (init?.method as AxiosRequestConfig['method']) || 'GET',
      data: init?.body,
      headers: lowerCasedHeaders,
      // Force the response to an arraybuffer type. Without this, the Response
      // object will try to guess the content type and add headers that weren't in
      // the response.
      // NOTE: Don't use 'stream' because it's not supported in the browser
      responseType: 'arraybuffer'
    };

    const config = transformer(rawConfig, input, init);

    let result;
    try {
      result = await axios.request(config);
    } catch (err: any) {
      if (err.response) {
        result = err.response;
      } else {
        throw err;
      }
    }

    return new Response(result.data, {
      status: result.status,
      statusText: result.statusText,
      headers: createFetchHeaders(result.headers)
    });
  };

export function buildAxiosFetch<Init extends RequestInit = RequestInit> (axios: AxiosInstance, transformer?: AxiosTransformer<Init>) {
  return axiosFetch(axios, transformer);
}

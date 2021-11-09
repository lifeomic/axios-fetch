import test from 'ava';
import nock from 'nock';
import fetch, {
  RequestInit as NodeRequestInit
} from 'node-fetch';
import { buildAxiosFetch } from '../src';
import axios, { AxiosInstance, AxiosPromise, AxiosRequestConfig } from 'axios';
import sinon from 'sinon';
import NodeFormData from 'form-data';

const TEST_URL_ROOT = 'https://localhost:1234';

type ExtrasInit = RequestInit & { extra?: any };

function cannonicalizeHeaders (headers: Record<string, any>): Record<string, string> {
  return Object.keys(headers).reduce((acc, key) => {
    let value = headers[key];
    if (Array.isArray(value) && value.length === 1) {
      value = value[0];
    } else {
      // All headers should be strings, but nock seems to
      // sometimes provide integer values for headers like
      // content-length
      value = String(value);
    }
    return Object.assign(acc, { key: value });
  }, {});
}

test.before(() => {
  nock.disableNetConnect();
  nock(TEST_URL_ROOT)
    .persist()
    .get('/success/text')
    .reply(200, 'OK!')
    .get('/success/json')
    .reply(200, { value: 'OK!' })
    .post('/headers')
    .reply(200, function () {
      return cannonicalizeHeaders(this.req.headers);
    })
    .post('/body')
    .reply(200, function (uri, body) {
      return {
        headers: cannonicalizeHeaders(this.req.headers),
        body
      };
    })
    .get('/failure')
    .reply(501)
    .get('/failureBody')
    .reply(400, { test: true })
    .get('/error')
    .replyWithError('simulated failure');
});

async function dualFetch (input: string, init: RequestInit = {}) {
  const expectedResponse = await fetch(input, init as NodeRequestInit);
  const axiosFetch = buildAxiosFetch(axios);
  const axiosResponse = await axiosFetch(input, init);

  return { expectedResponse, axiosResponse };
}

test('returns the expected response on success', async (test) => {
  const { expectedResponse, axiosResponse } = await dualFetch(`${TEST_URL_ROOT}/success/text`);

  test.truthy(axiosResponse.ok === expectedResponse.ok);
  test.truthy(axiosResponse.status === expectedResponse.status);
  test.truthy(axiosResponse.statusText === expectedResponse.statusText);
});

test('returns the expected response on a JSON body', async (test) => {
  const { expectedResponse, axiosResponse } = await dualFetch(`${TEST_URL_ROOT}/success/json`);

  const expectedBody = await expectedResponse.json();
  const axiosBody = await axiosResponse.json();
  test.deepEqual(axiosBody, expectedBody);
  test.deepEqual(axiosResponse.headers, expectedResponse.headers as any);
});

test('returns the expected response on a text body', async (test) => {
  const { expectedResponse, axiosResponse } = await dualFetch(`${TEST_URL_ROOT}/success/text`);

  const expectedBody = await expectedResponse.text();
  const axiosBody = await axiosResponse.text();
  test.deepEqual(axiosBody, expectedBody);
  test.deepEqual(axiosResponse.headers, expectedResponse.headers as any);
});

test('respects the headers init option', async (test) => {
  const init: RequestInit = {
    method: 'POST',
    headers: {
      'testheader': 'test-value'
    }
  };
  const { expectedResponse, axiosResponse } = await dualFetch(`${TEST_URL_ROOT}/headers`, init);

  const expectedBody = await expectedResponse.json();
  const axiosBody = await axiosResponse.json();
  test.deepEqual(axiosBody.testheader, expectedBody.testheader);
});

test('ensure any headers set to undefined are not added', async (test) => {
  const init: RequestInit = {
    method: 'POST',
    // @ts-expect-errors Undefined headers shouldn't be forwarded
    headers: {
      testheader: undefined
    }
  };
  const { expectedResponse, axiosResponse } = await dualFetch(`${TEST_URL_ROOT}/headers`, init);

  const expectedBody = await expectedResponse.json();
  const axiosBody = await axiosResponse.json();
  test.deepEqual(axiosBody.testheader, expectedBody.testheader);
});

test('ensure any headers with key set to undefined are not added', async (test) => {
  const init: RequestInit = {
    method: 'POST',
    headers: {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      undefined: 'test-value'
    }
  };
  const { expectedResponse, axiosResponse } = await dualFetch(`${TEST_URL_ROOT}/headers`, init);

  const expectedBody = await expectedResponse.json();
  const axiosBody = await axiosResponse.json();
  test.deepEqual(axiosBody.testheader, expectedBody.testheader);
});

test('handles text body init options', async (test) => {
  const init: RequestInit = {
    method: 'POST',
    body: 'some text'
  };
  const { expectedResponse, axiosResponse } = await dualFetch(`${TEST_URL_ROOT}/body`, init);

  const expectedBody = await expectedResponse.json();
  const axiosBody = await axiosResponse.json();
  test.deepEqual(axiosBody.body, expectedBody.body);
  test.deepEqual(axiosBody.headers['content-length'], expectedBody.headers['content-length']);
  test.deepEqual(axiosBody.headers['content-type'], expectedBody.headers['content-type']);
});

test('handles text body with content-type init options', async (test) => {
  const init: RequestInit = {
    method: 'POST',
    body: '{}',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const { expectedResponse, axiosResponse } = await dualFetch(`${TEST_URL_ROOT}/body`, init);

  const expectedBody = await expectedResponse.json();
  const axiosBody = await axiosResponse.json();
  test.deepEqual(axiosBody.body, expectedBody.body);
  test.deepEqual(axiosBody.headers['content-length'], expectedBody.headers['content-length']);
  test.deepEqual(axiosBody.headers['content-type'], expectedBody.headers['content-type']);
});

test('handles undefined body in init options', async (test) => {
  const init: RequestInit = {
    method: 'POST',
    body: undefined
  };
  const { expectedResponse, axiosResponse } = await dualFetch(`${TEST_URL_ROOT}/body`, init);

  const expectedBody = await expectedResponse.json();
  const axiosBody = await axiosResponse.json();

  test.deepEqual(axiosBody.body, expectedBody.body);
});

test('returns the expected response on a multipart request', async (test) => {
  const data = new NodeFormData();
  data.append('key', 'value');
  const init: RequestInit = {
    method: 'POST',
    body: data as unknown as FormData
  };

  const input = `${TEST_URL_ROOT}/body`;
  const expectedResponse = await fetch(input, init as NodeRequestInit);

  // FormData is a stream in Node, so you can't reuse it. Make a copy instead.
  const dataCopy = new NodeFormData() as NodeFormData & { _boundary: string };
  dataCopy._boundary = data.getBoundary();
  dataCopy.append('key', 'value');
  init.body = dataCopy as unknown as FormData;

  const axiosFetch = buildAxiosFetch(axios);
  const axiosResponse = await axiosFetch(input, init);

  const expectedBody = await expectedResponse.json();
  const axiosBody = await axiosResponse.json();

  test.deepEqual(axiosBody.body, expectedBody.body);
});

test('returns the expected response on HTTP status code failures', async (test) => {
  const { expectedResponse, axiosResponse } = await dualFetch(`${TEST_URL_ROOT}/failure`);

  test.truthy(axiosResponse.ok === expectedResponse.ok);
  test.truthy(axiosResponse.status === expectedResponse.status);
  test.truthy(axiosResponse.statusText === expectedResponse.statusText);
});

test('returns the expected response body on a failure', async (test) => {
  const { expectedResponse, axiosResponse } = await dualFetch(`${TEST_URL_ROOT}/failureBody`);

  const expectedBody = await expectedResponse.text();
  const axiosBody = await axiosResponse.text();
  test.deepEqual(axiosBody, expectedBody);
  test.deepEqual(axiosResponse.headers, expectedResponse.headers as any);
});

test('throws the original error on a network error', async (test) => {
  const axiosFetch = buildAxiosFetch(axios);
  const error = await test.throwsAsync(axiosFetch(`${TEST_URL_ROOT}/error`));
  test.is(error.message, 'simulated failure');
});

test('allows transforming request options', async (test) => {
  const originalUrl = `${TEST_URL_ROOT}/success/text`;
  const transformedUrl = `${TEST_URL_ROOT}/success/json`;

  let newConfig: AxiosRequestConfig = {};
  const transformer = sinon.stub().callsFake((config) => {
    newConfig = Object.create(config);
    newConfig.url = transformedUrl;
    return newConfig;
  });

  const client = axios.create();
  const requestSpy = sinon.spy(client, 'request');

  const axiosFetch = buildAxiosFetch<ExtrasInit>(client, transformer);

  const init: ExtrasInit = { extra: 'options' };
  await axiosFetch(originalUrl, init);

  // Make sure the transformer was called with the expected arguments
  test.is(transformer.callCount, 1, 'transformer call count');
  sinon.assert.calledOn(transformer, undefined);
  sinon.assert.calledWithExactly(transformer, sinon.match.object, originalUrl, init);

  // Make sure that the Axio client received the transformed config object
  test.is(requestSpy.callCount, 1, 'request call count');
  sinon.assert.calledOn(requestSpy, client);
  sinon.assert.calledWithExactly(requestSpy, newConfig);
});

type OlderAxiosFix = AxiosInstance & {
  (config: AxiosRequestConfig): AxiosPromise;
  (url: string, config?: AxiosRequestConfig): AxiosPromise;
};

test('works with axios interceptors', async (test) => {
  const instance = axios.create() as OlderAxiosFix;
  instance.interceptors.response.use(
    (successRes) => successRes,
    (error) => {
      error.config.url = `${TEST_URL_ROOT}/success/text`;
      return instance(error.config);
    }
  );
  const axiosFetch = buildAxiosFetch(instance);
  const axiosResponse = await axiosFetch(`${TEST_URL_ROOT}/failure`);
  test.truthy(axiosResponse.status === 200);
});

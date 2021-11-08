import test from 'ava';
import {
  createAxiosHeaders,
  createFetchHeaders,
  getUrl
} from '../src/typeUtils';
import { Headers, Request } from 'node-fetch';

const headersObject = {
  key1: 'value1',
  key2: 'value2, value3'
};

const headersArray = [
  ['key1', 'value1'],
  ['key2', 'value2', 'value3']
];

const headersClass = new Headers();
headersClass.append('key1', 'value1');
headersClass.append('key2', 'value2');
headersClass.append('key2', 'value3');

const testUrl = 'http://test.test.test';

test('createFetchHeaders will return an empty object on undefined', (t) => {
  const expected = new Headers();
  t.deepEqual(createFetchHeaders(), expected);
});

test('createFetchHeaders will create a proper Headers object', (t) => {
  t.deepEqual(createFetchHeaders(headersObject).raw(), headersClass.raw());
});

test('createAxiosHeaders will return an empty object on undefined', (t) => {
  t.deepEqual(createAxiosHeaders(), {});
});

test('createAxiosHeaders will format a Headers object for Axios', (t) => {
  t.deepEqual(createAxiosHeaders(headersClass), headersObject);
});

test('createAxiosHeaders will format header strings for Axios', (t) => {
  t.deepEqual(createAxiosHeaders(headersArray), headersObject);
});

test('createAxiosHeaders will assign headers to a new object', (t) => {
  const actual = createAxiosHeaders(headersObject);
  t.not(actual, headersObject);
  t.deepEqual(actual, headersObject);
});

test('getUrl will return undefined on undefined input', (t) => {
  t.is(getUrl(), undefined);
});

test('getUrl will return an input string', (t) => {
  t.is(getUrl(testUrl), testUrl);
});

test('getUrl will return a string for a URLLike object', (t) => {
  const urlLike = { href: testUrl };
  t.is(getUrl(urlLike), testUrl);
});

test('getUrl will return a string for a Request object', (t) => {
  const request = new Request(testUrl);
  t.is(getUrl(request), `${testUrl}/`);
});

# Axios-Fetch

[![npm](https://img.shields.io/npm/v/@lifeomic/axios-fetch.svg)](https://www.npmjs.com/package/@lifeomic/axios-fetch)
[![Build Status](https://github.com/lifeomic/axios-fetch/actions/workflows/release.yaml/badge.svg)](https://github.com/lifeomic/axios-fetch/actions/workflows/release.yaml)
[![Coverage Status](https://coveralls.io/repos/github/lifeomic/axios-fetch/badge.svg?branch=master)](https://coveralls.io/github/lifeomic/axios-fetch?branch=master)
![Dependabot Badge](https://flat.badgen.net/dependabot/lifeomic/axios-fetch?icon=dependabot)

This library exposes a Fetch WebAPI implementation backed by an Axios client
instance. This allows a bridge between projects that have pre-configured Axios
clients already to other libraries that require Fetch implementations.

## Global Response object

It is expected that the global Response object will be available. For testing we use the [node-fetch
](https://www.npmjs.com/package/node-fetch) library.

```typescript
import { Response } from 'node-fetch';
// @ts-expect-error node-fetch doesn't exactly match the Response object, but close enough.
global.Response = Response;
```

## Example

One library that wants a Fetch implementation is the [Apollo Link
HTTP](https://www.apollographql.com/docs/link/links/http.html) library. If your
project has an existing Axios client configured, then this project can help you
use that client in your apollo-link-http instance. Here is some sample code:

```javascript
const { buildAxiosFetch } = require("@lifeomic/axios-fetch");
const { createHttpLink } = require("apollo-link-http");
const link = createHttpLink({
  uri: "/graphql",
  fetch: buildAxiosFetch(yourAxiosInstance)
});
```

## Transforming requests

It is possible to transform requests before they reach your Axios client by providing
an optional argument to `buildAxiosFetch`. For example, if you wanted a fetch implementation
that always set the request timeout to 1 second, you could use code like:

```javascript
const { buildAxiosFetch } = require("@lifeomic/axios-fetch");
const fetch = buildAxiosFetch(yourAxiosInstance, function (config) {
  config.timeout = 1000;
  return config;
});
```

## Support for IE11

To Support IE11 add following dependencies

```
 npm install --save isomorphic-fetch
 npm install --save es6-promise
```

After adding these dependencies import in index.jsx file at top (Need to import before React)

```javascript
import * as es6Promise from 'es6-promise';
import 'isomorphic-fetch';

es6Promise.polyfill(); // below all import end
```


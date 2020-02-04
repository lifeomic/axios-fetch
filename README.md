# Axios-Fetch

[![Greenkeeper badge](https://badges.greenkeeper.io/lifeomic/axios-fetch.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/lifeomic/axios-fetch.svg?branch=master)](https://travis-ci.org/lifeomic/axios-fetch)
[![Coverage Status](https://coveralls.io/repos/github/lifeomic/axios-fetch/badge.svg?branch=master)](https://coveralls.io/github/lifeomic/axios-fetch?branch=master)

This library exposes a Fetch WebAPI implementation backed by a Axios client
instance. This allows a bridge between projects that have pre-configured Axios
clients already to other libraries that require Fetch implementations.

One library that wants a Fetch implementation is the [Apollo Link
HTTP](https://www.apollographql.com/docs/link/links/http.html) library. If your
project has an existing Axios client configured, then this project can help you
use that client in your apollo-link-http instance. Here is some sample code:

```javascript
const { buildAxiosFetch } = require("@lifeomic/axios-fetch");
const { createHttpLink } = require("apollo-link-http");
const link = createHttpLink({
  uri: "/graphql"
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


Summary
=======

This library exposes a Fetch WebAPI implementation backed by a Axios client
instance. This allows a bridge between projects that have pre-configured Axios
clients already to other libraries that require Fetch implementations.

One library that wants a Fetch implementation is the [Apollo Link
HTTP](https://www.apollographql.com/docs/link/links/http.html) library. If your
project has an existing Axios client configured, then this project can help you
use that client in your apollo-link-http instance. Here is some sample code:

```javascript
const { buildAxiosFetch } = require("axios-fetch");
const { createHttpLink } = require("apollo-link-http");
const link = createHttpLink({
  uri: "/graphql"
  fetch: buildAxiosFetch(yourAxiosInstance)
});
```
  
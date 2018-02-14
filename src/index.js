const { Response, Headers } = require('node-fetch');
const mapKeys = require('lodash/mapKeys');

/**
 * A Fetch WebAPI implementation based on the Axios client
 */
async function axiosFetch (axios, input, init = {}) {
  // Convert the `fetch` style arguments into a Axios style config

  const lowerCasedHeaders = mapKeys(init.headers, function (value, key) {
    return key.toLowerCase();
  });

  if (!('content-type' in lowerCasedHeaders)) {
    lowerCasedHeaders['content-type'] = 'text/plain;charset=UTF-8';
  }

  const config = {
    url: input,
    method: init.method || 'GET',
    data: String(init.body),
    headers: lowerCasedHeaders,
    validateStatus: () => true
  };

  const result = await axios.request(config);

  // Convert the Axios style response into a `fetch` style response
  const responseBody = typeof result.data === `object` ? JSON.stringify(result.data) : result.data;

  const headers = new Headers();
  Object.entries(result.headers).forEach(function ([key, value]) {
    headers.append(key, value);
  });

  return new Response(responseBody, {
    status: result.status,
    statusText: result.statusText,
    headers
  });
}

function buildAxiosFetch (axios) {
  return axiosFetch.bind(undefined, axios);
}

module.exports = {
  buildAxiosFetch
};

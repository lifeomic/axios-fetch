const { Response, Headers } = require('node-fetch');
const mapKeys = require('lodash.mapkeys');
const identity = require('lodash.identity');
const FormData = require('form-data');

/**
 * A Fetch WebAPI implementation based on the Axios client
 */
async function axiosFetch (axios, transfomer, input, init = {}) {
  // Convert the `fetch` style arguments into a Axios style config
  transfomer = transfomer || identity;

  const lowerCasedHeaders = mapKeys(init.headers, function (value, key) {
    return key.toLowerCase();
  });

  if (!('content-type' in lowerCasedHeaders)) {
    lowerCasedHeaders['content-type'] = 'text/plain;charset=UTF-8';
  }

  const config = transfomer({
    url: input,
    method: init.method || 'GET',
    data: typeof init.body === 'undefined' || init.body instanceof FormData ? init.body : String(init.body),
    headers: lowerCasedHeaders,
    validateStatus: () => true,
    // Force the response to an arraybuffer type. Without this, the Response
    // object will try to guess the content type and add headers that weren't in
    // the response.
    // NOTE: Don't use 'stream' becasue it's not supported in the browser
    responseType: 'arraybuffer'
  }, input, init);

  const result = await axios.request(config);

  const headers = new Headers(result.headers);

  return new Response(result.data, {
    status: result.status,
    statusText: result.statusText,
    headers
  });
}

function buildAxiosFetch (axios, transformer) {
  return axiosFetch.bind(undefined, axios, transformer);
}

module.exports = {
  buildAxiosFetch
};

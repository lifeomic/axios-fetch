"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAxiosFetch = void 0;
const node_fetch_1 = require("node-fetch");
const form_data_1 = __importDefault(require("form-data"));
/**
 * A Fetch WebAPI implementation based on the Axios client
 *
 * @param axios
 * @param transformer Convert the `fetch` style arguments into a Axios style config
 * @param input
 * @param init
 */
async function axiosFetch(axios, transformer, input, init) {
    // Request class handles for us all the input normalisation
    const request = new node_fetch_1.Request(input, init);
    const lowerCasedHeaders = {};
    for (const entry of request.headers.entries()) {
        lowerCasedHeaders[entry[0].toLowerCase()] = entry[1];
    }
    if (!('content-type' in lowerCasedHeaders)) {
        lowerCasedHeaders['content-type'] = 'text/plain;charset=UTF-8';
    }
    const data = (init === null || init === void 0 ? void 0 : init.body) instanceof form_data_1.default ? init === null || init === void 0 ? void 0 : init.body : await request.arrayBuffer();
    const rawConfig = {
        url: request.url,
        method: (request.method || 'GET'),
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
    }
    catch (err) {
        if (err.response) {
            result = err.response;
        }
        else {
            throw err;
        }
    }
    const fetchHeaders = new node_fetch_1.Headers(result.headers);
    return new node_fetch_1.Response(result.data, {
        status: result.status,
        statusText: result.statusText,
        headers: fetchHeaders
    });
}
function buildAxiosFetch(axios, transformer) {
    return axiosFetch.bind(undefined, axios, transformer);
}
exports.buildAxiosFetch = buildAxiosFetch;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSwyQ0FBa0c7QUFFbEcsMERBQWlDO0FBTWpDOzs7Ozs7O0dBT0c7QUFDSCxLQUFLLFVBQVUsVUFBVSxDQUN2QixLQUFvQixFQUNwQixXQUF5QyxFQUN6QyxLQUFrQixFQUNsQixJQUFrQjtJQUVsQiwyREFBMkQ7SUFDM0QsTUFBTSxPQUFPLEdBQUcsSUFBSSxvQkFBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN6QyxNQUFNLGlCQUFpQixHQUEyQixFQUFFLENBQUM7SUFFckQsS0FBSyxNQUFNLEtBQUssSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFO1FBQzdDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN0RDtJQUVELElBQUksQ0FBQyxDQUFDLGNBQWMsSUFBSSxpQkFBaUIsQ0FBQyxFQUFFO1FBQzFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxHQUFHLDBCQUEwQixDQUFDO0tBQ2hFO0lBRUQsTUFBTSxJQUFJLEdBQUcsQ0FBQSxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsSUFBSSxhQUFZLG1CQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBRXZGLE1BQU0sU0FBUyxHQUF1QjtRQUNwQyxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUc7UUFDaEIsTUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQWlDO1FBQ2pFLElBQUksRUFBRSxJQUFJO1FBQ1YsT0FBTyxFQUFFLGlCQUFpQjtRQUMxQix3RUFBd0U7UUFDeEUsNEVBQTRFO1FBQzVFLGdCQUFnQjtRQUNoQixxRUFBcUU7UUFDckUsWUFBWSxFQUFFLGFBQWE7S0FDNUIsQ0FBQztJQUVGLE1BQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztJQUU3RSxJQUFJLE1BQU0sQ0FBQztJQUNYLElBQUk7UUFDRixNQUFNLEdBQUcsTUFBTSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3RDO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDWixJQUFJLEdBQUcsQ0FBQyxRQUFRLEVBQUU7WUFDaEIsTUFBTSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUM7U0FDdkI7YUFBTTtZQUNMLE1BQU0sR0FBRyxDQUFDO1NBQ1g7S0FDRjtJQUVELE1BQU0sWUFBWSxHQUFHLElBQUksb0JBQVksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFdEQsT0FBTyxJQUFJLHFCQUFRLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTtRQUMvQixNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU07UUFDckIsVUFBVSxFQUFFLE1BQU0sQ0FBQyxVQUFVO1FBQzdCLE9BQU8sRUFBRSxZQUFZO0tBQ3RCLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRCxTQUFnQixlQUFlLENBQUUsS0FBb0IsRUFBRSxXQUE4QjtJQUNuRixPQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQztBQUN4RCxDQUFDO0FBRkQsMENBRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBSZXNwb25zZSwgUmVxdWVzdCwgSGVhZGVycyBhcyBGZXRjaEhlYWRlcnMsIFJlcXVlc3RJbmZvLCBSZXF1ZXN0SW5pdCB9IGZyb20gJ25vZGUtZmV0Y2gnO1xuaW1wb3J0IHsgQXhpb3NJbnN0YW5jZSwgQXhpb3NSZXF1ZXN0Q29uZmlnIH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgRm9ybURhdGEgZnJvbSAnZm9ybS1kYXRhJztcblxuZXhwb3J0IHR5cGUgQXhpb3NUcmFuc2Zvcm1lciA9IChjb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZywgaW5wdXQ6IFJlcXVlc3RJbmZvLCBpbml0PzogUmVxdWVzdEluaXQpID0+IEF4aW9zUmVxdWVzdENvbmZpZztcblxuZXhwb3J0IHR5cGUgQXhpb3NGZXRjaCA9IChpbnB1dDogUmVxdWVzdEluZm8sIGluaXQ/OiBSZXF1ZXN0SW5pdCkgPT4gUHJvbWlzZTxSZXNwb25zZT47XG5cbi8qKlxuICogQSBGZXRjaCBXZWJBUEkgaW1wbGVtZW50YXRpb24gYmFzZWQgb24gdGhlIEF4aW9zIGNsaWVudFxuICpcbiAqIEBwYXJhbSBheGlvc1xuICogQHBhcmFtIHRyYW5zZm9ybWVyIENvbnZlcnQgdGhlIGBmZXRjaGAgc3R5bGUgYXJndW1lbnRzIGludG8gYSBBeGlvcyBzdHlsZSBjb25maWdcbiAqIEBwYXJhbSBpbnB1dFxuICogQHBhcmFtIGluaXRcbiAqL1xuYXN5bmMgZnVuY3Rpb24gYXhpb3NGZXRjaCAoXG4gIGF4aW9zOiBBeGlvc0luc3RhbmNlLFxuICB0cmFuc2Zvcm1lcjogQXhpb3NUcmFuc2Zvcm1lciB8IHVuZGVmaW5lZCxcbiAgaW5wdXQ6IFJlcXVlc3RJbmZvLFxuICBpbml0PzogUmVxdWVzdEluaXRcbikge1xuICAvLyBSZXF1ZXN0IGNsYXNzIGhhbmRsZXMgZm9yIHVzIGFsbCB0aGUgaW5wdXQgbm9ybWFsaXNhdGlvblxuICBjb25zdCByZXF1ZXN0ID0gbmV3IFJlcXVlc3QoaW5wdXQsIGluaXQpO1xuICBjb25zdCBsb3dlckNhc2VkSGVhZGVyczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuXG4gIGZvciAoY29uc3QgZW50cnkgb2YgcmVxdWVzdC5oZWFkZXJzLmVudHJpZXMoKSkge1xuICAgIGxvd2VyQ2FzZWRIZWFkZXJzW2VudHJ5WzBdLnRvTG93ZXJDYXNlKCldID0gZW50cnlbMV07XG4gIH1cblxuICBpZiAoISgnY29udGVudC10eXBlJyBpbiBsb3dlckNhc2VkSGVhZGVycykpIHtcbiAgICBsb3dlckNhc2VkSGVhZGVyc1snY29udGVudC10eXBlJ10gPSAndGV4dC9wbGFpbjtjaGFyc2V0PVVURi04JztcbiAgfVxuXG4gIGNvbnN0IGRhdGEgPSBpbml0Py5ib2R5IGluc3RhbmNlb2YgRm9ybURhdGEgPyBpbml0Py5ib2R5IDogYXdhaXQgcmVxdWVzdC5hcnJheUJ1ZmZlcigpO1xuXG4gIGNvbnN0IHJhd0NvbmZpZzogQXhpb3NSZXF1ZXN0Q29uZmlnID0ge1xuICAgIHVybDogcmVxdWVzdC51cmwsXG4gICAgbWV0aG9kOiAocmVxdWVzdC5tZXRob2QgfHwgJ0dFVCcpIGFzIEF4aW9zUmVxdWVzdENvbmZpZ1snbWV0aG9kJ10sXG4gICAgZGF0YTogZGF0YSxcbiAgICBoZWFkZXJzOiBsb3dlckNhc2VkSGVhZGVycyxcbiAgICAvLyBGb3JjZSB0aGUgcmVzcG9uc2UgdG8gYW4gYXJyYXlidWZmZXIgdHlwZS4gV2l0aG91dCB0aGlzLCB0aGUgUmVzcG9uc2VcbiAgICAvLyBvYmplY3Qgd2lsbCB0cnkgdG8gZ3Vlc3MgdGhlIGNvbnRlbnQgdHlwZSBhbmQgYWRkIGhlYWRlcnMgdGhhdCB3ZXJlbid0IGluXG4gICAgLy8gdGhlIHJlc3BvbnNlLlxuICAgIC8vIE5PVEU6IERvbid0IHVzZSAnc3RyZWFtJyBiZWNhdXNlIGl0J3Mgbm90IHN1cHBvcnRlZCBpbiB0aGUgYnJvd3NlclxuICAgIHJlc3BvbnNlVHlwZTogJ2FycmF5YnVmZmVyJ1xuICB9O1xuXG4gIGNvbnN0IGNvbmZpZyA9IHRyYW5zZm9ybWVyID8gdHJhbnNmb3JtZXIocmF3Q29uZmlnLCBpbnB1dCwgaW5pdCkgOiByYXdDb25maWc7XG5cbiAgbGV0IHJlc3VsdDtcbiAgdHJ5IHtcbiAgICByZXN1bHQgPSBhd2FpdCBheGlvcy5yZXF1ZXN0KGNvbmZpZyk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGlmIChlcnIucmVzcG9uc2UpIHtcbiAgICAgIHJlc3VsdCA9IGVyci5yZXNwb25zZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGZldGNoSGVhZGVycyA9IG5ldyBGZXRjaEhlYWRlcnMocmVzdWx0LmhlYWRlcnMpO1xuXG4gIHJldHVybiBuZXcgUmVzcG9uc2UocmVzdWx0LmRhdGEsIHtcbiAgICBzdGF0dXM6IHJlc3VsdC5zdGF0dXMsXG4gICAgc3RhdHVzVGV4dDogcmVzdWx0LnN0YXR1c1RleHQsXG4gICAgaGVhZGVyczogZmV0Y2hIZWFkZXJzXG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRBeGlvc0ZldGNoIChheGlvczogQXhpb3NJbnN0YW5jZSwgdHJhbnNmb3JtZXI/OiBBeGlvc1RyYW5zZm9ybWVyKTogQXhpb3NGZXRjaCB7XG4gIHJldHVybiBheGlvc0ZldGNoLmJpbmQodW5kZWZpbmVkLCBheGlvcywgdHJhbnNmb3JtZXIpO1xufVxuIl19
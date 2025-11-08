import { auth } from "~/lib/auth/config";

export default defineEventHandler(async (event) => {
    const headers = new Headers();
    const eventHeaders = getHeaders(event);
    
    for (const [key, value] of Object.entries(eventHeaders)) {
        if (value) {
            headers.set(key, value);
        }
    }

    const request = new Request(getRequestURL(event), {
        method: getMethod(event),
        headers,
        body: event.node.req.method !== 'GET' && event.node.req.method !== 'HEAD' 
            ? await readRawBody(event) 
            : undefined,
    });

    const response = await auth.handler(request);
    
    // Set response headers
    response.headers.forEach((value, key) => {
        setHeader(event, key, value);
    });

    // Set status code
    setResponseStatus(event, response.status);

    // Return response body
    return response.body ? new Response(response.body).text() : null;
});
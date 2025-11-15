export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  
  if (method === 'POST') {
    const body = await readBody(event);
    
    console.log('Test endpoint - Request received');
    console.log('Method:', method);
    console.log('Body:', body);
    console.log('Headers:', getHeaders(event));
    
    return {
      success: true,
      message: 'Test endpoint working',
      data: {
        receivedBody: body,
        method: method,
        timestamp: new Date().toISOString()
      }
    };
  }
  
  return {
    success: false,
    message: 'Only POST method allowed'
  };
});
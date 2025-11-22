// Security Testing Script for Logic Sekai API
const BASE_URL = 'http://localhost:3000'

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
}

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️ ${msg}${colors.reset}`)
}

async function testSecurityHeaders() {
  log.info('Testing Security Headers...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/products`)
    const headers = response.headers
    
    // Check security headers
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options', 
      'x-xss-protection',
      'referrer-policy',
      'content-security-policy',
      'x-api-version'
    ]
    
    securityHeaders.forEach(header => {
      if (headers.has(header)) {
        log.success(`Security header present: ${header} = ${headers.get(header)}`)
      } else {
        log.error(`Missing security header: ${header}`)
      }
    })
    
  } catch (error) {
    log.error(`Security headers test failed: ${error.message}`)
  }
}

async function testPublicEndpoints() {
  log.info('Testing Public Endpoints...')
  
  const publicEndpoints = [
    '/api/products',
    '/api/products/featured',
    '/api/categories',
    '/api/auth/login'
  ]
  
  for (const endpoint of publicEndpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`)
      if (response.ok || response.status === 400) { // 400 is OK for login without body
        log.success(`Public endpoint accessible: ${endpoint}`)
      } else {
        log.warning(`Public endpoint returned ${response.status}: ${endpoint}`)
      }
    } catch (error) {
      log.error(`Public endpoint test failed for ${endpoint}: ${error.message}`)
    }
  }
}

async function testProtectedEndpoints() {
  log.info('Testing Protected Endpoints (should require auth)...')
  
  const protectedEndpoints = [
    '/api/creator/products',
    '/api/admin/users',
    '/api/ownership/test-id'
  ]
  
  for (const endpoint of protectedEndpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`)
      if (response.status === 401) {
        log.success(`Protected endpoint properly secured: ${endpoint}`)
      } else {
        log.error(`Protected endpoint not secured (${response.status}): ${endpoint}`)
      }
    } catch (error) {
      log.error(`Protected endpoint test failed for ${endpoint}: ${error.message}`)
    }
  }
}

async function testRateLimit() {
  log.info('Testing Rate Limiting...')
  
  const requests = []
  const testEndpoint = '/api/products'
  
  // Send 10 rapid requests
  for (let i = 0; i < 10; i++) {
    requests.push(fetch(`${BASE_URL}${testEndpoint}`))
  }
  
  try {
    const responses = await Promise.all(requests)
    const statusCodes = responses.map(r => r.status)
    
    log.info(`Rate limit test responses: ${statusCodes.join(', ')}`)
    
    // Check for rate limit headers
    const firstResponse = responses[0]
    if (firstResponse.headers.has('x-ratelimit-limit')) {
      log.success(`Rate limit headers present: ${firstResponse.headers.get('x-ratelimit-limit')} limit`)
    } else {
      log.warning('Rate limit headers not found')
    }
    
  } catch (error) {
    log.error(`Rate limit test failed: ${error.message}`)
  }
}

async function testInvalidAuth() {
  log.info('Testing Invalid Authentication...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/creator/products`, {
      headers: {
        'Cookie': 'user-session=invalid-session-data'
      }
    })
    
    if (response.status === 401) {
      log.success('Invalid auth properly rejected')
    } else {
      log.error(`Invalid auth not properly rejected (${response.status})`)
    }
    
  } catch (error) {
    log.error(`Invalid auth test failed: ${error.message}`)
  }
}

async function testCORS() {
  log.info('Testing CORS...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/products`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET'
      }
    })
    
    if (response.headers.has('access-control-allow-origin')) {
      log.success(`CORS configured: ${response.headers.get('access-control-allow-origin')}`)
    } else {
      log.warning('CORS headers not found')
    }
    
  } catch (error) {
    log.error(`CORS test failed: ${error.message}`)
  }
}

async function testSQLInjection() {
  log.info('Testing SQL Injection Protection...')
  
  const sqlPayloads = [
    "'; DROP TABLE users; --",
    "1' OR '1'='1",
    "admin'/*",
    "1; SELECT * FROM users"
  ]
  
  for (const payload of sqlPayloads) {
    try {
      const response = await fetch(`${BASE_URL}/api/products?search=${encodeURIComponent(payload)}`)
      
      // Should either return normal results or error, but not crash
      if (response.status < 500) {
        log.success(`SQL injection payload handled safely: ${payload.substring(0, 20)}...`)
      } else {
        log.warning(`SQL injection payload caused server error: ${payload.substring(0, 20)}...`)
      }
      
    } catch (error) {
      log.error(`SQL injection test failed for payload: ${error.message}`)
    }
  }
}

// Main test runner
async function runSecurityTests() {
  console.log(`${colors.blue}🔒 Starting Security Tests for Logic Sekai API${colors.reset}\n`)
  
  await testSecurityHeaders()
  console.log()
  
  await testPublicEndpoints()
  console.log()
  
  await testProtectedEndpoints()
  console.log()
  
  await testRateLimit()
  console.log()
  
  await testInvalidAuth()
  console.log()
  
  await testCORS()
  console.log()
  
  await testSQLInjection()
  console.log()
  
  log.info('Security tests completed!')
}

// Run tests
runSecurityTests().catch(console.error)

export {
  runSecurityTests,
  testSecurityHeaders,
  testPublicEndpoints,
  testProtectedEndpoints,
  testRateLimit,
  testInvalidAuth,
  testCORS,
  testSQLInjection
}
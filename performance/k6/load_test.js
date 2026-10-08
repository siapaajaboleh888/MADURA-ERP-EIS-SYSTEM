import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp-up to 20 virtual users
    { duration: '1m', target: 20 },   // Sustained load
    { duration: '30s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete within 500ms
    http_req_failed: ['rate<0.01'],   // Error rate below 1%
  },
};

const BASE_URL = __ENV.API_BASE_URL || 'http://127.0.0.1:8000/api';

export default function () {
  // 1. Health check endpoint test
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
    'health response is healthy': (r) => r.json('success') === true,
  });

  // 2. Authentication load
  const payload = JSON.stringify({
    email: 'admin@madura-erp.local',
    password: 'password123',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };

  const loginRes = http.post(`${BASE_URL}/auth/login`, payload, params);
  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'has token': (r) => r.json('data.token') !== undefined,
  });

  const token = loginRes.json('data.token');
  const authParams = {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  // 3. Products Master Data Query under load
  const productsRes = http.get(`${BASE_URL}/products`, authParams);
  check(productsRes, {
    'products status is 200': (r) => r.status === 200,
  });

  // 4. Executive Dashboard Analytics Query
  const eisRes = http.get(`${BASE_URL}/eis/dashboard`, authParams);
  check(eisRes, {
    'dashboard status is 200': (r) => r.status === 200,
  });

  sleep(1);
}

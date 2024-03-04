import { createSuperRequest, devLogin, setupServer } from '../../jest.utils';

describe('Rate Limiting', () => {
  let superGet: ReturnType<typeof createSuperRequest>;

  beforeAll(async () => {
    // process.env.TESTING_RATE_LIMIT = 'true';
  });

  setupServer(true);

  beforeEach(async () => {
    const setCookies = await devLogin();
    superGet = createSuperRequest({ method: 'GET', setCookies });
  });

  test('Should rate limit excessive requests', async () => {
    const route = '/status/ping';

    for (let i = 0; i < 30; i++) {
      // Not rate-limited yet
      const response = await superGet(route);
      expect(response.statusCode).not.toBe(429);
    }

    // Expect a 429 Too Many Requests response
    const rateLimitedResponse = await superGet(route);
    expect(rateLimitedResponse.statusCode).toBe(429);
  });

  afterEach(() => {
    process.env.TESTING_RATE_LIMIT = 'false';
  });
});

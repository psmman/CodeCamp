/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import jwt, { JwtPayload } from 'jsonwebtoken';
import type { Prisma } from '@prisma/client';
import { ObjectId } from 'mongodb';
import _ from 'lodash';

import { defaultUser } from '../utils/default-user';
import {
  defaultUserId,
  defaultUserEmail,
  devLogin,
  setupServer,
  superRequest
} from '../../jest.utils';
import { JWT_SECRET } from '../utils/env';
import { generateReportEmail } from '../utils/email-templates';

// This is used to build a test user.
const testUserData: Prisma.userCreateInput = {
  ...defaultUser,
  email: defaultUserEmail,
  username: 'foobar',
  usernameDisplay: 'Foo Bar',
  progressTimestamps: [1520002973119, 1520440323273],
  completedChallenges: [
    {
      id: 'a6b0bb188d873cb2c8729495',
      completedDate: 1520002973119,
      solution: null,
      challengeType: 5,
      files: [
        {
          contents: 'test',
          ext: 'js',
          key: 'indexjs',
          name: 'test',
          path: 'path-test'
        },
        {
          contents: 'test2',
          ext: 'html',
          key: 'html-test',
          name: 'test2'
        }
      ]
    },
    {
      id: 'a5229172f011153519423690',
      completedDate: 1520440323273,
      solution: null,
      challengeType: 5,
      files: []
    },
    {
      id: 'a5229172f011153519423692',
      completedDate: 1520440323274,
      githubLink: '',
      challengeType: 5
    }
  ],
  partiallyCompletedChallenges: [{ id: '123', completedDate: 123 }],
  githubProfile: 'github.com/foobar',
  website: 'https://www.freecodecamp.org',
  donationEmails: ['an@add.ress'],
  portfolio: [
    {
      description: 'A portfolio',
      id: 'a6b0bb188d873cb2c8729495',
      image: 'https://www.freecodecamp.org/cat.png',
      title: 'A portfolio',
      url: 'https://www.freecodecamp.org'
    }
  ],
  savedChallenges: [
    {
      id: 'abc123',
      lastSavedDate: 123,
      files: [
        {
          contents: 'test-contents',
          ext: 'js',
          history: ['indexjs'],
          key: 'indexjs',
          name: 'test-name'
        }
      ]
    }
  ],
  sound: true,
  yearsTopContributor: ['2018'],
  twitter: '@foobar',
  linkedin: 'linkedin.com/foobar'
};

const minimalUserData: Prisma.userCreateInput = {
  about: 'I am a test user',
  acceptedPrivacyTerms: true,
  email: testUserData.email,
  emailVerified: true,
  externalId: '1234567890',
  isDonating: false,
  picture: 'https://www.freecodecamp.org/cat.png',
  sendQuincyEmail: true,
  username: 'testuser',
  unsubscribeId: '1234567890'
};

// These are not part of the schema, but are added to the user object by
// get-session-user's handler
const computedProperties = {
  calendar: {},
  completedChallengeCount: 0,
  completedChallenges: [], // we don't need to provide an empty array, prisma will create it
  isEmailVerified: minimalUserData.emailVerified,
  points: 1,
  portfolio: [],
  yearsTopContributor: [],
  // This is the default value if profileUI is missing. If individual properties
  // are missing from the db, they will be omitted from the response.
  profileUI: {
    isLocked: true,
    showAbout: false,
    showCerts: false,
    showDonation: false,
    showHeatMap: false,
    showLocation: false,
    showName: false,
    showPoints: false,
    showPortfolio: false,
    showTimeLine: false
  }
};

// This is (most of) what we expect to get back from the API. The remaining
// properties are 'id' and 'joinDate', which are generated by the database.
// We're currently filtering properties with null values, since the old api just
// would not return those.
const publicUserData = {
  about: testUserData.about,
  calendar: { 1520002973: 1, 1520440323: 1 },
  // testUserData.completedChallenges, with nulls removed
  completedChallenges: [
    {
      id: 'a6b0bb188d873cb2c8729495',
      completedDate: 1520002973119,
      challengeType: 5,
      files: [
        {
          contents: 'test',
          ext: 'js',
          key: 'indexjs',
          name: 'test',
          path: 'path-test'
        },
        {
          contents: 'test2',
          ext: 'html',
          key: 'html-test',
          name: 'test2'
        }
      ]
    },
    {
      id: 'a5229172f011153519423690',
      completedDate: 1520440323273,
      challengeType: 5,
      files: []
    },
    {
      id: 'a5229172f011153519423692',
      completedDate: 1520440323274,
      githubLink: '',
      challengeType: 5,
      files: []
    }
  ],
  githubProfile: testUserData.githubProfile,
  isApisMicroservicesCert: testUserData.isApisMicroservicesCert,
  isBackEndCert: testUserData.isBackEndCert,
  isCheater: testUserData.isCheater,
  isDonating: testUserData.isDonating,
  isEmailVerified: testUserData.emailVerified,
  is2018DataVisCert: testUserData.is2018DataVisCert,
  isDataVisCert: testUserData.isDataVisCert,
  isFrontEndCert: testUserData.isFrontEndCert,
  isFullStackCert: testUserData.isFullStackCert,
  isFrontEndLibsCert: testUserData.isFrontEndLibsCert,
  isHonest: testUserData.isHonest,
  isInfosecQaCert: testUserData.isInfosecQaCert,
  isQaCertV7: testUserData.isQaCertV7,
  isInfosecCertV7: testUserData.isInfosecCertV7,
  isJsAlgoDataStructCert: testUserData.isJsAlgoDataStructCert,
  isRelationalDatabaseCertV8: testUserData.isRelationalDatabaseCertV8,
  isRespWebDesignCert: testUserData.isRespWebDesignCert,
  isSciCompPyCertV7: testUserData.isSciCompPyCertV7,
  isDataAnalysisPyCertV7: testUserData.isDataAnalysisPyCertV7,
  isMachineLearningPyCertV7: testUserData.isMachineLearningPyCertV7,
  isCollegeAlgebraPyCertV8: testUserData.isCollegeAlgebraPyCertV8,
  linkedin: testUserData.linkedin,
  location: testUserData.location,
  name: testUserData.name,
  partiallyCompletedChallenges: [{ id: '123', completedDate: 123 }],
  picture: testUserData.picture,
  points: 2,
  portfolio: testUserData.portfolio,
  profileUI: testUserData.profileUI,
  username: testUserData.usernameDisplay, // It defaults to usernameDisplay
  website: testUserData.website,
  yearsTopContributor: testUserData.yearsTopContributor,
  currentChallengeId: testUserData.currentChallengeId,
  email: testUserData.email,
  emailVerified: testUserData.emailVerified,
  sendQuincyEmail: testUserData.sendQuincyEmail,
  theme: testUserData.theme,
  twitter: 'https://twitter.com/foobar',
  sound: testUserData.sound,
  keyboardShortcuts: testUserData.keyboardShortcuts,
  completedChallengeCount: 3,
  acceptedPrivacyTerms: testUserData.acceptedPrivacyTerms,
  savedChallenges: testUserData.savedChallenges
};

const baseProgressData = {
  currentChallengeId: '',
  isRespWebDesignCert: false,
  is2018DataVisCert: false,
  isFrontEndLibsCert: false,
  isJsAlgoDataStructCert: false,
  isApisMicroservicesCert: false,
  isInfosecQaCert: false,
  isQaCertV7: false,
  isInfosecCertV7: false,
  is2018FullStackCert: false,
  isFrontEndCert: false,
  isBackEndCert: false,
  isDataVisCert: false,
  isFullStackCert: false,
  isSciCompPyCertV7: false,
  isDataAnalysisPyCertV7: false,
  isMachineLearningPyCertV7: false,
  isRelationalDatabaseCertV8: false,
  isCollegeAlgebraPyCertV8: false,
  completedChallenges: [],
  savedChallenges: [],
  partiallyCompletedChallenges: [],
  needsModeration: false
};

const modifiedProgressData = {
  ...baseProgressData,
  currentChallengeId: 'hello there',
  isRespWebDesignCert: true,
  isJsAlgoDataStructCert: true,
  isRelationalDatabaseCertV8: true,
  needsModeration: true
};

const userTokenId = 'dummy-id';

describe('userRoutes', () => {
  setupServer();

  describe('Authenticated user', () => {
    let setCookies: string[];

    beforeEach(async () => {
      setCookies = await devLogin();
    });

    describe('/account/delete', () => {
      test('POST returns 200 status code with empty object', async () => {
        const response = await superRequest('/account/delete', {
          method: 'POST',
          setCookies
        });

        const userCount = await fastifyTestInstance.prisma.user.count({
          where: { email: testUserData.email }
        });

        expect(response.body).toStrictEqual({});
        expect(response.status).toBe(200);
        expect(userCount).toBe(0);
      });
    });

    describe('/account/reset-progress', () => {
      test('POST returns 200 status code with empty object', async () => {
        await fastifyTestInstance.prisma.user.updateMany({
          where: { email: testUserData.email },
          data: modifiedProgressData
        });

        const response = await superRequest('/account/reset-progress', {
          method: 'POST',
          setCookies
        });

        const user = await fastifyTestInstance.prisma.user.findFirst({
          where: { email: testUserData.email }
        });

        expect(response.body).toStrictEqual({});
        expect(response.status).toBe(200);

        expect(user?.progressTimestamps).toHaveLength(1);
        expect(user).toMatchObject(baseProgressData);
      });
    });

    describe('/user/user-token', () => {
      beforeEach(async () => {
        await fastifyTestInstance.prisma.userToken.create({
          data: {
            created: new Date(),
            id: '123',
            ttl: 1000,
            userId: defaultUserId
          }
        });
      });

      afterEach(async () => {
        await fastifyTestInstance.prisma.userToken.deleteMany({
          where: {
            userId: defaultUserId
          }
        });
      });

      // TODO(Post-MVP): consider using PUT and updating the logic to upsert
      test('POST success response includes a JWT encoded string', async () => {
        const response = await superRequest('/user/user-token', {
          method: 'POST',
          setCookies
        });

        const userToken = response.body.userToken;
        const decodedToken = jwt.decode(userToken);

        expect(response.body).toStrictEqual({ userToken: expect.any(String) });
        expect(decodedToken).toStrictEqual({
          userToken: expect.stringMatching(/^[a-zA-Z0-9]{64}$/),
          iat: expect.any(Number)
        });

        expect(() => jwt.verify(userToken, 'wrong-secret')).toThrow();
        expect(() => jwt.verify(userToken, JWT_SECRET)).not.toThrow();

        // TODO(Post-MVP): consider using 201 for new tokens.
        expect(response.status).toBe(200);
      });

      test('POST responds with an encoded UserToken id', async () => {
        const response = await superRequest('/user/user-token', {
          method: 'POST',
          setCookies
        });

        const decodedToken = jwt.decode(response.body.userToken);
        const userTokenId = (decodedToken as JwtPayload).userToken;

        // Verify that the token has been created.
        await fastifyTestInstance.prisma.userToken.findUniqueOrThrow({
          where: { id: userTokenId }
        });

        // TODO(Post-MVP): consider using 201 for new tokens.
        expect(response.status).toBe(200);
      });

      test('POST deletes old tokens when creating a new one', async () => {
        const response = await superRequest('/user/user-token', {
          method: 'POST',
          setCookies
        });

        const decodedToken = jwt.decode(response.body.userToken);
        const userTokenId = (decodedToken as JwtPayload).userToken;

        // Verify that the token has been created.
        await fastifyTestInstance.prisma.userToken.findUniqueOrThrow({
          where: { id: userTokenId }
        });

        await superRequest('/user/user-token', {
          method: 'POST',
          setCookies
        });

        // Verify that the old token has been deleted.
        expect(
          await fastifyTestInstance.prisma.userToken.findUnique({
            where: { id: userTokenId }
          })
        ).toBeNull();
        expect(await fastifyTestInstance.prisma.userToken.count()).toBe(1);
      });

      test('DELETE returns 200 status with null userToken', async () => {
        const response = await superRequest('/user/user-token', {
          method: 'DELETE',
          setCookies
        });

        expect(response.body).toStrictEqual({ userToken: null });
        expect(response.status).toBe(200);
        expect(await fastifyTestInstance.prisma.userToken.count()).toBe(0);
      });

      test('DELETEing a missing userToken returns 404 status with an error message', async () => {
        await superRequest('/user/user-token', {
          method: 'DELETE',
          setCookies
        });

        const response = await superRequest('/user/user-token', {
          method: 'DELETE',
          setCookies
        });

        expect(response.body).toStrictEqual({
          type: 'info',
          message: 'userToken not found'
        });
        expect(response.status).toBe(404);
      });
    });

    describe('user/get-user-session', () => {
      beforeEach(async () => {
        await fastifyTestInstance.prisma.user.updateMany({
          where: { email: testUserData.email },
          data: testUserData
        });
      });

      afterEach(async () => {
        await fastifyTestInstance.prisma.userToken.deleteMany({
          where: { id: userTokenId }
        });
      });

      test('GET rejects with 500 status code if the username is missing', async () => {
        await fastifyTestInstance.prisma.user.updateMany({
          where: { email: testUserData.email },
          data: { username: '' }
        });

        const response = await superRequest('/user/get-session-user', {
          method: 'GET',
          setCookies
        });

        expect(response.body).toStrictEqual({ user: {}, result: '' });
        expect(response.statusCode).toBe(500);
      });

      test('GET returns username as the result property', async () => {
        const response = await superRequest('/user/get-session-user', {
          method: 'GET',
          setCookies
        });

        expect(response.body).toMatchObject({
          result: testUserData.username
        });
        expect(response.statusCode).toBe(200);
      });

      test('GET returns the public user object', async () => {
        // TODO: This gets the user from the database so that we can verify the
        // joinDate. It feels like there should be a better way to do this.
        const testUser = await fastifyTestInstance?.prisma.user.findFirst({
          where: { email: testUserData.email }
        });
        const publicUser = {
          ...publicUserData,
          id: testUser?.id,
          joinDate: new ObjectId(testUser?.id).getTimestamp().toISOString()
        };

        const response = await superRequest('/user/get-session-user', {
          method: 'GET',
          setCookies
        });
        const {
          user: { foobar }
        } = response.body as unknown as {
          user: { foobar: typeof publicUser };
        };

        expect(testUser).not.toBeNull();
        expect(testUser?.id).not.toBeNull();
        expect(foobar).toEqual(publicUser);
      });

      test('GET returns the userToken if it exists', async () => {
        const tokenData = {
          userId: defaultUserId,
          ttl: 123,
          id: userTokenId,
          created: new Date()
        };

        await fastifyTestInstance.prisma.userToken.create({
          data: tokenData
        });

        const tokens = await fastifyTestInstance.prisma.userToken.count();
        expect(tokens).toBe(1);

        const response = await superRequest('/user/get-session-user', {
          method: 'GET',
          setCookies
        });

        const { userToken } = jwt.decode(
          response.body.user.foobar.userToken
        ) as { userToken: string };

        expect(tokenData.id).toBe(userToken);
      });

      test('GET returns a minimal user when all optional properties are missing', async () => {
        // To get a minimal test user we first delete the existing one...
        await fastifyTestInstance.prisma.user.deleteMany({
          where: {
            email: minimalUserData.email
          }
        });
        // ...then recreate it using only the properties that the schema
        // requires. The alternative is to update, but that would require
        // a lot of unsets (this is neater)
        const testUser = await fastifyTestInstance.prisma.user.create({
          data: minimalUserData
        });

        // devLogin must not be used here since it overrides the user
        const res = await superRequest('/auth/dev-callback', { method: 'GET' });
        setCookies = res.get('Set-Cookie');

        const publicUser = {
          ..._.omit(minimalUserData, ['externalId', 'unsubscribeId']),
          ...computedProperties,
          id: testUser?.id,
          joinDate: new ObjectId(testUser?.id).getTimestamp().toISOString()
        };

        const response = await superRequest('/user/get-session-user', {
          method: 'GET',
          setCookies
        });

        const {
          user: { testuser }
        } = response.body as unknown as {
          user: { testuser: typeof publicUser };
        };

        expect(testuser).toStrictEqual(publicUser);
      });
    });

    describe('/user/report-user', () => {
      let sendEmailSpy: jest.SpyInstance;
      beforeEach(() => {
        sendEmailSpy = jest
          .spyOn(fastifyTestInstance, 'sendEmail')
          .mockImplementation(jest.fn());
      });

      afterEach(() => {
        jest.clearAllMocks();
      });

      test('POST returns 400 for empty username', async () => {
        const response = await superRequest('/user/report-user', {
          method: 'POST',
          setCookies
        }).send({
          username: '',
          reportDescription: 'Test Report'
        });

        expect(response.statusCode).toBe(400);
        expect(response.body).toStrictEqual({
          type: 'danger',
          message: 'flash.provide-username'
        });
      });

      test('POST returns 400 for empty report', async () => {
        const response = await superRequest('/user/report-user', {
          method: 'POST',
          setCookies
        }).send({
          username: 'darth-vader',
          reportDescription: ''
        });

        expect(response.statusCode).toBe(400);
        expect(response.body).toStrictEqual({
          type: 'danger',
          message: 'flash.provide-username'
        });
      });

      test('POST sanitises report description', async () => {
        await superRequest('/user/report-user', {
          method: 'POST',
          setCookies
        }).send({
          username: 'darth-vader',
          reportDescription:
            '<script>const breath = "loud"</script>Luke, I am your father'
        });

        expect(sendEmailSpy).toBeCalledTimes(1);
        expect(sendEmailSpy).toBeCalledWith(
          expect.objectContaining({
            text: expect.stringContaining(
              'Report Details:\n\nLuke, I am your father'
            )
          })
        );
      });

      test('POST returns 200 status code with "success" message', async () => {
        const response = await superRequest('/user/report-user', {
          method: 'POST',
          setCookies
        }).send({
          username: 'darth-vader',
          reportDescription: 'Luke, I am your father'
        });

        const user = await fastifyTestInstance.prisma.user.findFirstOrThrow({
          where: { email: 'foo@bar.com' }
        });

        expect(sendEmailSpy).toBeCalledTimes(1);
        expect(sendEmailSpy).toBeCalledWith({
          from: 'team@freecodecamp.org',
          to: 'support@freecodecamp.org',
          cc: user.email,
          subject: "Abuse Report: Reporting darth-vader's profile",
          text: generateReportEmail(
            user,
            'darth-vader',
            'Luke, I am your father'
          )
        });

        expect(response.statusCode).toBe(200);
        expect(response.body).toStrictEqual({
          type: 'info',
          message: 'flash.report-sent',
          variables: { email: user.email }
        });
      });
    });
  });

  describe('Unauthenticated user', () => {
    let setCookies: string[];
    // Get the CSRF cookies from an unprotected route
    beforeAll(async () => {
      const res = await superRequest('/', { method: 'GET' });
      setCookies = res.get('Set-Cookie');
    });

    describe('/account/delete', () => {
      test('POST returns 401 status code with error message', async () => {
        const response = await superRequest('/account/delete', {
          method: 'POST',
          setCookies
        });

        expect(response.statusCode).toBe(401);
      });
    });

    describe('/account/reset-progress', () => {
      test('POST returns 401 status code with error message', async () => {
        const response = await superRequest('/account/reset-progress', {
          method: 'POST',
          setCookies
        });

        expect(response.statusCode).toBe(401);
      });
    });

    describe('/user/get-user-session', () => {
      test('GET returns 401 status code with error message', async () => {
        const response = await superRequest('/user/get-session-user', {
          method: 'GET',
          setCookies
        });

        expect(response.statusCode).toBe(401);
      });
    });

    describe('/user/user-token', () => {
      test('DELETE returns 401 status code with error message', async () => {
        const response = await superRequest('/user/user-token', {
          method: 'DELETE',
          setCookies
        });

        expect(response.statusCode).toBe(401);
      });

      test('POST returns 401 status code with error message', async () => {
        const response = await superRequest('/user/user-token', {
          method: 'POST',
          setCookies
        });

        expect(response.statusCode).toBe(401);
      });
    });

    describe('/user/report-user', () => {
      test('POST returns 401 status code with error message', async () => {
        const response = await superRequest('/user/report-user', {
          method: 'POST',
          setCookies
        });

        expect(response.statusCode).toBe(401);
      });
    });
  });
});

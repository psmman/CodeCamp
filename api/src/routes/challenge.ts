import {
  type FastifyPluginCallbackTypebox,
  Type
} from '@fastify/type-provider-typebox';

import { formatValidationError } from '../utils/error-formatting';
import { canSubmitCodeRoadCertProject } from './helpers/challenge-helpers';

export const challengeRoutes: FastifyPluginCallbackTypebox = (
  fastify,
  _options,
  done
) => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  fastify.addHook('onRequest', fastify.csrfProtection);
  fastify.addHook('onRequest', fastify.authenticateSession);

  fastify.post(
    '/project-completed',
    {
      schema: {
        body: Type.Object({
          id: Type.String({ format: 'objectid', maxLength: 24 }),
          challengeType: Type.Optional(Type.Number()),
          solution: Type.String({ format: 'url', maxLength: 1024 })
        }),
        response: {
          // TODO: update to correct schema and test success case.
          200: Type.Object({ done: Type.Boolean() }),
          400: Type.Object({
            type: Type.Literal('error'),
            message: Type.String()
            // TODO: use literals if possible.
            // message: Type.Union([
            //   Type.Literal(
            //     'That does not appear to be a valid challenge submission.'
            //   ),
            //   Type.Literal(
            //     'You have not provided the valid links for us to inspect your work.'
            //   )
            // ])
          }),
          403: Type.Object({
            type: Type.Literal('error'),
            message: Type.Literal(
              'You have to complete the project before you can submit a URL.'
            )
          })
        }
      },
      errorHandler(error, request, reply) {
        if (error.validation) {
          void reply.code(400);
          return formatValidationError(error.validation);
        } else {
          this.errorHandler(error, request, reply);
        }
      }
    },
    async (req, reply) => {
      const { id: projectId, challengeType } = req.body;

      try {
        const user = await fastify.prisma.user.findUniqueOrThrow({
          where: { id: req.session.user.id },
          select: {
            completedChallenges: true,
            partiallyCompletedChallenges: true
          }
        });

        if (
          challengeType === 13 &&
          !canSubmitCodeRoadCertProject(projectId, user)
        ) {
          void reply.code(403);
          return {
            type: 'error',
            message:
              'You have to complete the project before you can submit a URL.'
          } as const;
        }

        return { done: true };
      } catch (err) {
        // TODO: send to Sentry
        fastify.log.error(err);
        void reply.code(500);
        // TODO: use proper error message.
        return { message: '', type: 'error' } as const;
      }
    }
  );

  done();
};

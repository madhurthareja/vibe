import {MongoMemoryServer} from 'mongodb-memory-server';
import request from 'supertest';
import Express from 'express';
import {RoutingControllersOptions, useExpressServer} from 'routing-controllers';
import {Container} from 'typedi';
import {MongoDatabase} from '../../../shared/database/providers/mongo/MongoDatabase';
import {authModuleOptions, setupAuthModuleDependencies} from 'modules/auth';
import {
  coursesModuleOptions,
  setupCoursesModuleDependencies,
} from 'modules/courses';
import {setupUsersModuleDependencies, usersModuleOptions} from '..';
import {createFullEnrollmentFixture, Fixture} from './common';
import {faker} from '@faker-js/faker/.';

describe('Progress Controller Integration Tests', () => {
  const appInstance = Express();
  let app;
  let mongoServer: MongoMemoryServer;
  let f: Fixture;

  beforeAll(async () => {
    //Set env variables
    process.env.NODE_ENV = 'test';

    // Start an in-memory MongoDB servera
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    Container.set('Database', new MongoDatabase(uri, 'vibe'));

    setupAuthModuleDependencies();
    setupCoursesModuleDependencies();
    setupUsersModuleDependencies();

    // Create the Express app with routing-controllers configuration
    const options: RoutingControllersOptions = {
      controllers: [
        ...(authModuleOptions.controllers as Function[]),
        ...(coursesModuleOptions.controllers as Function[]),
        ...(usersModuleOptions.controllers as Function[]),
      ],
      authorizationChecker: async (action, roles) => {
        return true;
      },
      defaultErrorHandler: true,
      validation: true,
    };

    app = useExpressServer(appInstance, options);

    f = await createFullEnrollmentFixture(app);
  });

  afterAll(async () => {
    // Stop the in-memory MongoDB server
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // TODO: Optionally reset database state before each test
  });

  // ------Tests for Create <ModuleName>------
  describe('Fetch Progress Data', () => {
    it('should fetch the progress', async () => {
      const {userId, courseId, courseVersionId, moduleId, sectionId, itemId} =
        f;

      // Find progress of the user
      const progressResponse = await request(app)
        .get(
          `/users/${userId}/progress/courses/${courseId}/versions/${courseVersionId}`,
        )
        .expect(200);

      // Expect the response to contain the progress data
      expect(progressResponse.body).toHaveProperty('userId');
      expect(progressResponse.body.userId).toBe(userId);

      expect(progressResponse.body).toHaveProperty('courseId');
      expect(progressResponse.body.courseId).toBe(courseId);

      expect(progressResponse.body).toHaveProperty('courseVersionId');
      expect(progressResponse.body.courseVersionId).toBe(courseVersionId);

      expect(progressResponse.body).toHaveProperty('currentModule');
      expect(progressResponse.body.currentModule).toBe(moduleId);

      expect(progressResponse.body).toHaveProperty('currentSection');
      expect(progressResponse.body.currentSection).toBe(sectionId);

      expect(progressResponse.body).toHaveProperty('currentItem');
      expect(progressResponse.body.currentItem).toBe(itemId);

      expect(progressResponse.body).toHaveProperty('completed');
      expect(progressResponse.body.completed).toBe(false);
    });

    it('should return 400 if userId is invalid', async () => {
      const invalidUserId = 'invalidUserId';
      const courseId = f.courseId;
      const courseVersionId = f.courseVersionId;

      const response = await request(app)
        .get(
          `/users/${invalidUserId}/progress/courses/${courseId}/versions/${courseVersionId}`,
        )
        .expect(400);

      //expect body.errors to be truthy
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toBeTruthy();
      expect(response.body.errors[0].constraints).toHaveProperty('isMongoId');
    });

    it('should return 400 if courseId is invalid', async () => {
      const userId = f.userId;
      const invalidCourseId = 'invalidCourseId';
      const courseVersionId = f.courseVersionId;

      const response = await request(app)
        .get(
          `/users/${userId}/progress/courses/${invalidCourseId}/versions/${courseVersionId}`,
        )
        .expect(400);

      //expect body.errors to be truthy
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toBeTruthy();
      expect(response.body.errors[0].constraints).toHaveProperty('isMongoId');
    });

    it('should return 400 if courseVersionId is invalid', async () => {
      const userId = f.userId;
      const courseId = f.courseId;
      const invalidCourseVersionId = 'invalidCourseVersionId';

      const response = await request(app)
        .get(
          `/users/${userId}/progress/courses/${courseId}/versions/${invalidCourseVersionId}`,
        )
        .expect(400);
      //expect body.errors to be truthy
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toBeTruthy();
      expect(response.body.errors[0].constraints).toHaveProperty('isMongoId');
    });

    it('should return 404 if progress not found when courseId and courseVersionId are fake', async () => {
      const userId = f.userId;
      const courseId = faker.database.mongodbObjectId();
      const courseVersionId = faker.database.mongodbObjectId();

      const response = await request(app)
        .get(
          `/users/${userId}/progress/courses/${courseId}/versions/${courseVersionId}`,
        )
        .expect(404);

      console.log(response.body);

      //expect body.errors to be truthy
      expect(response.body).toHaveProperty('name');
      expect(response.body.name).toBe('NotFoundError');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Progress not found');
    });

    it('should return 404 if progress not found when userId is fake', async () => {
      const userId = faker.database.mongodbObjectId();
      const courseId = f.courseId;
      const courseVersionId = f.courseVersionId;

      const response = await request(app)
        .get(
          `/users/${userId}/progress/courses/${courseId}/versions/${courseVersionId}`,
        )
        .expect(404);

      //expect body.errors to be truthy
      expect(response.body).toHaveProperty('name');
      expect(response.body.name).toBe('NotFoundError');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Progress not found');
    });

    it('should return 404 if progress not found when all params are fake', async () => {
      const userId = faker.database.mongodbObjectId();
      const courseId = faker.database.mongodbObjectId();
      const courseVersionId = faker.database.mongodbObjectId();

      const response = await request(app)
        .get(
          `/users/${userId}/progress/courses/${courseId}/versions/${courseVersionId}`,
        )
        .expect(404);

      //expect body.errors to be truthy
      expect(response.body).toHaveProperty('name');
      expect(response.body.name).toBe('NotFoundError');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Progress not found');
    });
  });
});

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
import {
  setupUsersModuleDependencies,
  StartItemBody,
  StopItemBody,
  UpdateProgressBody,
  usersModuleOptions,
} from '..';
import {createFullEnrollmentFixture, Fixture} from './common';
import {faker} from '@faker-js/faker/.';
import {isMongoId} from 'class-validator';
import {ProgressService} from '../services/ProgressService';
import {ProgressRepository} from 'shared/database/providers/mongo/repositories/ProgressRepository';
import {CourseRepository} from 'shared/database/providers/mongo/repositories/CourseRepository';
import {UserRepository} from 'shared/database/providers/MongoDatabaseProvider';

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

    const progressService = new ProgressService(
      Container.get<ProgressRepository>('ProgressRepo'),
      Container.get<CourseRepository>('CourseRepo'),
      Container.get<UserRepository>('UserRepo'),
    );

    // Remove the old ProgressService from the container
    if (Container.has('ProgressService')) {
      Container.remove('ProgressService');
    }
    Container.set('ProgressService', progressService);

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
  }, 100000);

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
      //expect body.errors to be truthy
      expect(response.body).toHaveProperty('name');
      expect(response.body.name).toBe('NotFoundError');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Course not found');
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
      expect(response.body.message).toBe('User not found');
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
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('Start Item', () => {
    it('should start the item tracking for recording progress', async () => {
      const {userId, courseId, courseVersionId, moduleId, sectionId, itemId} =
        f;
      const startItemBody: StartItemBody = {
        itemId,
        moduleId,
        sectionId,
      };
      // Start the item progress
      const startItemResponse = await request(app)
        .post(
          `/users/${userId}/progress/courses/${courseId}/versions/${courseVersionId}/start`,
        )
        .send(startItemBody)
        .expect(200);

      // Expect the response to contain the watchItemId
      expect(startItemResponse.body).toHaveProperty('watchItemId');
      expect(startItemResponse.body.watchItemId).toBeTruthy();
      expect(isMongoId(startItemResponse.body.watchItemId)).toBe(true);
    });
  });

  describe('Stop Item', () => {
    it('should stop the item tracking for recording progress', async () => {
      const {userId, courseId, courseVersionId, moduleId, sectionId, itemId} =
        f;
      const startItemBody: StartItemBody = {
        itemId,
        moduleId,
        sectionId,
      };
      // Start the item progress
      const startItemResponse = await request(app)
        .post(
          `/users/${userId}/progress/courses/${courseId}/versions/${courseVersionId}/start`,
        )
        .send(startItemBody)
        .expect(200);

      //log the response
      console.log('Start Item Response:', startItemResponse.body);

      // Stop the item progress
      const stopItemBody: StopItemBody = {
        sectionId,
        moduleId,
        itemId,
        watchItemId: startItemResponse.body.watchItemId,
      };

      const stopItemResponse = await request(app)
        .post(
          `/users/${userId}/progress/courses/${courseId}/versions/${courseVersionId}/stop`,
        )
        .send(stopItemBody)
        .expect(200);
    });
  });

  describe('Update Progress', () => {
    it('should update the progress', async () => {
      const {userId, courseId, courseVersionId, moduleId, sectionId, itemId} =
        f;
      // Start the item progress
      const startItemBody: StartItemBody = {
        itemId,
        moduleId,
        sectionId,
      };
      const startItemResponse = await request(app)
        .post(
          `/users/${userId}/progress/courses/${courseId}/versions/${courseVersionId}/start`,
        )
        .send(startItemBody)
        .expect(200);

      //log the response
      console.log('Start Item Response:', startItemResponse.body);

      // Stop the item progress
      const stopItemBody: StopItemBody = {
        sectionId,
        moduleId,
        itemId,
        watchItemId: startItemResponse.body.watchItemId,
      };
      const stopItemResponse = await request(app)
        .post(
          `/users/${userId}/progress/courses/${courseId}/versions/${courseVersionId}/stop`,
        )
        .send(stopItemBody)
        .expect(200);
      //log the response

      console.log('Stop Item Response:', stopItemResponse.status);

      // Update the progress
      const updateProgressBody: UpdateProgressBody = {
        moduleId: moduleId,
        sectionId: sectionId,
        itemId: itemId,
        watchItemId: startItemResponse.body.watchItemId,
      };

      jest
        .spyOn(ProgressService.prototype as any, 'isValidWatchTime')
        .mockReturnValueOnce(true);

      const updateProgressResponse = await request(app)
        .patch(
          `/users/${userId}/progress/courses/${courseId}/versions/${courseVersionId}/update`,
        )
        .send(updateProgressBody);
      //log the response
      console.log('Update Progress Response:', updateProgressResponse.status);
      //log the body
      console.log('Update Progress Body:', updateProgressResponse.body);

      // Expect the response to be 200
    });
  });
});

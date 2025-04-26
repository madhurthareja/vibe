// tests/helpers.ts
import request from 'supertest';
import {faker} from '@faker-js/faker';
import {useExpressServer} from 'routing-controllers';
import Express from 'express';

export interface Fixture {
  userId: string;
  courseId: string;
  courseVersionId: string;
  moduleId: string;
  sectionId: string;
  itemId: string;
}

export async function createFullEnrollmentFixture(
  app: typeof Express,
): Promise<Fixture> {
  // 1) signup
  const signUpBody = {
    email: faker.internet.email(),
    password: faker.internet.password(),
    firstName: faker.person.firstName().replace(/[^a-zA-Z]/g, ''),
    lastName: faker.person.lastName().replace(/[^a-zA-Z]/g, ''),
  };
  const signUpRes = await request(app)
    .post('/auth/signup')
    .send(signUpBody)
    .expect(201);
  const userId = signUpRes.body.id;

  // 2) course
  const courseRes = await request(app)
    .post('/courses')
    .send({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
    })
    .expect(201);
  const courseId = courseRes.body._id;

  // 3) version
  const versionRes = await request(app)
    .post(`/courses/${courseId}/versions`)
    .send({version: '1.0', description: 'Initial version'})
    .expect(201);
  const courseVersionId = versionRes.body.version._id;

  // 4) module
  const moduleRes = await request(app)
    .post(`/courses/versions/${courseVersionId}/modules`)
    .send({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
    })
    .expect(201);
  const moduleId = moduleRes.body.version.modules[0].moduleId;

  const module2Res = await request(app)
    .post(`/courses/versions/${courseVersionId}/modules`)
    .send({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
    })
    .expect(201);

  // 5) section
  const sectionRes = await request(app)
    .post(`/courses/versions/${courseVersionId}/modules/${moduleId}/sections`)
    .send({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
    })
    .expect(201);
  const sectionId = sectionRes.body.version.modules[0].sections[0].sectionId;

  const section2Res = await request(app)
    .post(`/courses/versions/${courseVersionId}/modules/${moduleId}/sections`)
    .send({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
    })
    .expect(201);

  // 6) item
  const itemRes = await request(app)
    .post(
      `/courses/versions/${courseVersionId}/modules/${moduleId}/sections/${sectionId}/items`,
    )
    .send({
      name: 'Item1',
      description: 'This an item',
      type: 'VIDEO',
      videoDetails: {
        URL: 'http://url.com',
        startTime: '00:00:00',
        endTime: '00:00:40',
        points: '10.5',
      },
    })
    .expect(201);
  const itemId = itemRes.body.itemsGroup.items[0].itemId;

  const item2Res = await request(app)
    .post(
      `/courses/versions/${courseVersionId}/modules/${moduleId}/sections/${sectionId}/items`,
    )
    .send({
      name: 'Item1',
      description: 'This an item',
      type: 'VIDEO',
      videoDetails: {
        URL: 'http://url.com',
        startTime: '00:00:00',
        endTime: '00:00:40',
        points: '10.5',
      },
    })
    .expect(201);

  // 7) enroll
  await request(app)
    .post(
      `/users/${userId}/enrollments/courses/${courseId}/versions/${courseVersionId}`,
    )
    .expect(200);

  return {userId, courseId, courseVersionId, moduleId, sectionId, itemId};
}

import request from 'supertest';
import Express from 'express';

export interface EnrollmentParams {
  userId: string;
  courseId: string;
  courseVersionId: string;
}

export async function createEnrollment(
  app: typeof Express,
  userId: string,
  courseId: string,
  courseVersionId: string,
  firstModuleId: string,
  firstSectionId: string,
  firstItemId: string,
) {
  const enrollmentParams: EnrollmentParams = {
    userId: userId,
    courseId: courseId,
    courseVersionId: courseVersionId,
  };

  // Perform the POST request to enroll the user
  const enrollmentResponse = await request(app).post(
    `/users/${enrollmentParams.userId}/enrollments/courses/${enrollmentParams.courseId}/versions/${enrollmentParams.courseVersionId}`,
  );

  // Ensure the response status is 200 and check the properties
  expect(enrollmentResponse.status).toBe(200);
  expect(enrollmentResponse.body).toHaveProperty('enrollment');
  expect(enrollmentResponse.body).toHaveProperty('progress');

  // Check properties for enrollment
  expect(enrollmentResponse.body.enrollment).toHaveProperty('userId');
  expect(enrollmentResponse.body.enrollment.userId).toBe(
    enrollmentParams.userId,
  );

  expect(enrollmentResponse.body.enrollment).toHaveProperty('courseId');
  expect(enrollmentResponse.body.enrollment.courseId).toBe(
    enrollmentParams.courseId,
  );

  expect(enrollmentResponse.body.enrollment).toHaveProperty('courseVersionId');
  expect(enrollmentResponse.body.enrollment.courseVersionId).toBe(
    enrollmentParams.courseVersionId,
  );

  // Check properties for progress
  expect(enrollmentResponse.body.progress).toHaveProperty('currentModule');
  expect(enrollmentResponse.body.progress.currentModule).toBe(firstModuleId); // Replace with actual `moduleId`

  expect(enrollmentResponse.body.progress).toHaveProperty('currentSection');
  expect(enrollmentResponse.body.progress.currentSection).toBe(firstSectionId); // Replace with actual `sectionId`

  expect(enrollmentResponse.body.progress).toHaveProperty('currentItem');
  expect(enrollmentResponse.body.progress.currentItem).toBe(firstItemId); // Replace with actual `itemId`

  // Return the enrollment response to use in the tests if needed
  return enrollmentResponse.body;
}

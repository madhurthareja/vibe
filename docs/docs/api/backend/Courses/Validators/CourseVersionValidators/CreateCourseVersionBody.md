Defined in: [classes/validators/CourseVersionValidators.ts:10](https://github.com/continuousactivelearning/vibe/blob/93348bcba2a36924136fc58524ad1ed4cb960f87/backend/src/modules/courses/classes/validators/CourseVersionValidators.ts#L10)

DTO for creating a new course version.

## Implements

- `Partial`\<`ICourseVersion`\>

## Constructors

### Constructor

> **new CreateCourseVersionBody**(): `CreateCourseVersionBody`

#### Returns

`CreateCourseVersionBody`

## Properties

### courseId

> **courseId**: `string`

Defined in: [classes/validators/CourseVersionValidators.ts:16](https://github.com/continuousactivelearning/vibe/blob/93348bcba2a36924136fc58524ad1ed4cb960f87/backend/src/modules/courses/classes/validators/CourseVersionValidators.ts#L16)

ID of the course this version belongs to.
This is auto-populated and should remain empty in the request body.

#### Implementation of

`Partial.courseId`

***

### description

> **description**: `string`

Defined in: [classes/validators/CourseVersionValidators.ts:30](https://github.com/continuousactivelearning/vibe/blob/93348bcba2a36924136fc58524ad1ed4cb960f87/backend/src/modules/courses/classes/validators/CourseVersionValidators.ts#L30)

A brief description of the course version.

#### Implementation of

`Partial.description`

***

### version

> **version**: `string`

Defined in: [classes/validators/CourseVersionValidators.ts:23](https://github.com/continuousactivelearning/vibe/blob/93348bcba2a36924136fc58524ad1ed4cb960f87/backend/src/modules/courses/classes/validators/CourseVersionValidators.ts#L23)

The version label or identifier (e.g., "v1.0", "Fall 2025").

#### Implementation of

`Partial.version`

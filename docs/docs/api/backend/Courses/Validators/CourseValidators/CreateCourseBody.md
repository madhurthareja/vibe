Defined in: [classes/validators/CourseValidators.ts:18](https://github.com/continuousactivelearning/vibe/blob/bbe96e7b9c72b9bbcc5896c45a0f74ad711a9075/backend/src/modules/courses/classes/validators/CourseValidators.ts#L18)

DTO for creating a course.

## Implements

- `Partial`\<`ICourse`\>

## Constructors

### Constructor

> **new CreateCourseBody**(): `CreateCourseBody`

#### Returns

`CreateCourseBody`

## Properties

### description

> **description**: `string`

Defined in: [classes/validators/CourseValidators.ts:36](https://github.com/continuousactivelearning/vibe/blob/bbe96e7b9c72b9bbcc5896c45a0f74ad711a9075/backend/src/modules/courses/classes/validators/CourseValidators.ts#L36)

A brief description of the course.
Max length is 1000 characters.

#### Implementation of

`Partial.description`

***

### name

> **name**: `string`

Defined in: [classes/validators/CourseValidators.ts:27](https://github.com/continuousactivelearning/vibe/blob/bbe96e7b9c72b9bbcc5896c45a0f74ad711a9075/backend/src/modules/courses/classes/validators/CourseValidators.ts#L27)

The name of the course.
Must be between 3 and 255 characters.

#### Implementation of

`Partial.name`

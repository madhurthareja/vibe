Defined in: [classes/validators/ItemValidators.ts:346](https://github.com/continuousactivelearning/vibe/blob/bbe96e7b9c72b9bbcc5896c45a0f74ad711a9075/backend/src/modules/courses/classes/validators/ItemValidators.ts#L346)

Body to move an item within its section.

## Constructors

### Constructor

> **new MoveItemBody**(): `MoveItemBody`

#### Returns

`MoveItemBody`

## Properties

### afterItemId?

> `optional` **afterItemId**: `string`

Defined in: [classes/validators/ItemValidators.ts:353](https://github.com/continuousactivelearning/vibe/blob/bbe96e7b9c72b9bbcc5896c45a0f74ad711a9075/backend/src/modules/courses/classes/validators/ItemValidators.ts#L353)

Move after this item (optional).

***

### beforeItemId?

> `optional` **beforeItemId**: `string`

Defined in: [classes/validators/ItemValidators.ts:361](https://github.com/continuousactivelearning/vibe/blob/bbe96e7b9c72b9bbcc5896c45a0f74ad711a9075/backend/src/modules/courses/classes/validators/ItemValidators.ts#L361)

Move before this item (optional).

***

### bothNotAllowed

> **bothNotAllowed**: `string`

Defined in: [classes/validators/ItemValidators.ts:379](https://github.com/continuousactivelearning/vibe/blob/bbe96e7b9c72b9bbcc5896c45a0f74ad711a9075/backend/src/modules/courses/classes/validators/ItemValidators.ts#L379)

Validation helper – both afterItemId and beforeItemId cannot be present at the same time.

***

### onlyOneAllowed

> **onlyOneAllowed**: `string`

Defined in: [classes/validators/ItemValidators.ts:370](https://github.com/continuousactivelearning/vibe/blob/bbe96e7b9c72b9bbcc5896c45a0f74ad711a9075/backend/src/modules/courses/classes/validators/ItemValidators.ts#L370)

Validation helper – at least one of afterItemId or beforeItemId must be present.

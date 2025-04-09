Defined in: [classes/validators/ModuleValidators.ts:121](https://github.com/continuousactivelearning/vibe/blob/ba7fd29459f44e164192b6f3b1178ced23288f0a/backend/src/modules/courses/classes/validators/ModuleValidators.ts#L121)

Payload for moving a module within its version.

## Constructors

### Constructor

> **new MoveModuleBody**(): `MoveModuleBody`

#### Returns

`MoveModuleBody`

## Properties

### afterModuleId?

> `optional` **afterModuleId**: `string`

Defined in: [classes/validators/ModuleValidators.ts:128](https://github.com/continuousactivelearning/vibe/blob/ba7fd29459f44e164192b6f3b1178ced23288f0a/backend/src/modules/courses/classes/validators/ModuleValidators.ts#L128)

Optional: Move the module after this ID.

***

### beforeModuleId?

> `optional` **beforeModuleId**: `string`

Defined in: [classes/validators/ModuleValidators.ts:136](https://github.com/continuousactivelearning/vibe/blob/ba7fd29459f44e164192b6f3b1178ced23288f0a/backend/src/modules/courses/classes/validators/ModuleValidators.ts#L136)

Optional: Move the module before this ID.

***

### bothNotAllowed

> **bothNotAllowed**: `string`

Defined in: [classes/validators/ModuleValidators.ts:155](https://github.com/continuousactivelearning/vibe/blob/ba7fd29459f44e164192b6f3b1178ced23288f0a/backend/src/modules/courses/classes/validators/ModuleValidators.ts#L155)

Validation helper: both afterModuleId and beforeModuleId should not be used together.

***

### onlyOneAllowed

> **onlyOneAllowed**: `string`

Defined in: [classes/validators/ModuleValidators.ts:146](https://github.com/continuousactivelearning/vibe/blob/ba7fd29459f44e164192b6f3b1178ced23288f0a/backend/src/modules/courses/classes/validators/ModuleValidators.ts#L146)

Validation helper: at least one of afterModuleId or beforeModuleId is required.

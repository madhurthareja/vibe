Defined in: [classes/validators/ModuleValidators.ts:89](https://github.com/continuousactivelearning/vibe/blob/ba7fd29459f44e164192b6f3b1178ced23288f0a/backend/src/modules/courses/classes/validators/ModuleValidators.ts#L89)

Payload for updating an existing module.
Supports partial updates.

## Implements

- `Partial`\<`IModule`\>

## Constructors

### Constructor

> **new UpdateModuleBody**(): `UpdateModuleBody`

#### Returns

`UpdateModuleBody`

## Properties

### description

> **description**: `string`

Defined in: [classes/validators/ModuleValidators.ts:104](https://github.com/continuousactivelearning/vibe/blob/ba7fd29459f44e164192b6f3b1178ced23288f0a/backend/src/modules/courses/classes/validators/ModuleValidators.ts#L104)

New description of the module (optional).

#### Implementation of

`Partial.description`

***

### name

> **name**: `string`

Defined in: [classes/validators/ModuleValidators.ts:96](https://github.com/continuousactivelearning/vibe/blob/ba7fd29459f44e164192b6f3b1178ced23288f0a/backend/src/modules/courses/classes/validators/ModuleValidators.ts#L96)

New name of the module (optional).

#### Implementation of

`Partial.name`

***

### nameOrDescription

> **nameOrDescription**: `string`

Defined in: [classes/validators/ModuleValidators.ts:113](https://github.com/continuousactivelearning/vibe/blob/ba7fd29459f44e164192b6f3b1178ced23288f0a/backend/src/modules/courses/classes/validators/ModuleValidators.ts#L113)

At least one of `name` or `description` must be provided.

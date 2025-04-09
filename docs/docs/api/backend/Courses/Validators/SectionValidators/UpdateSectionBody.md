Defined in: [classes/validators/SectionValidators.ts:90](https://github.com/continuousactivelearning/vibe/blob/ba7fd29459f44e164192b6f3b1178ced23288f0a/backend/src/modules/courses/classes/validators/SectionValidators.ts#L90)

Payload for updating a section.
Allows partial updates to name or description.

## Implements

- `Partial`\<`ISection`\>

## Constructors

### Constructor

> **new UpdateSectionBody**(): `UpdateSectionBody`

#### Returns

`UpdateSectionBody`

## Properties

### description

> **description**: `string`

Defined in: [classes/validators/SectionValidators.ts:105](https://github.com/continuousactivelearning/vibe/blob/ba7fd29459f44e164192b6f3b1178ced23288f0a/backend/src/modules/courses/classes/validators/SectionValidators.ts#L105)

New description of the section (optional).

#### Implementation of

`Partial.description`

***

### name

> **name**: `string`

Defined in: [classes/validators/SectionValidators.ts:97](https://github.com/continuousactivelearning/vibe/blob/ba7fd29459f44e164192b6f3b1178ced23288f0a/backend/src/modules/courses/classes/validators/SectionValidators.ts#L97)

New name of the section (optional).

#### Implementation of

`Partial.name`

***

### nameOrDescription

> **nameOrDescription**: `string`

Defined in: [classes/validators/SectionValidators.ts:114](https://github.com/continuousactivelearning/vibe/blob/ba7fd29459f44e164192b6f3b1178ced23288f0a/backend/src/modules/courses/classes/validators/SectionValidators.ts#L114)

At least one of name or description must be provided.

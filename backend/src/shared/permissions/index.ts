class Action {
  constructor(
    public readonly name: string,
    public readonly description?: string,
  ) {}

  toString() {
    return this.name;
  }
}

class Subject {
  constructor(
    public readonly name: string,
    public readonly actions: Action[],
  ) {}

  listActions() {
    return this.actions.map(a => a.toString());
  }
}

const COURSE_ACTIONS: Action[] = [
  new Action('CREATE', 'Create a new course'),
  new Action('READ', 'Read course details'),
  new Action('UPDATE', 'Update course details'),
  new Action('DELETE', 'Delete a course'),
];
const COURSE: Subject = new Subject('Course', COURSE_ACTIONS);

console.log(COURSE);

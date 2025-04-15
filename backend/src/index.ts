if (process.env.NODE_ENV === 'production') {
  import('./instrument');
}
import Express from 'express';
import Sentry from '@sentry/node';
import {loggingHandler} from 'shared/middleware/loggingHandler';
import {
  RoutingControllersOptions,
  useContainer,
  useExpressServer,
} from 'routing-controllers';
import {coursesModuleOptions} from 'modules/courses';
import Container from 'typedi';
import {IDatabase} from 'shared/database';
import {MongoDatabase} from 'shared/database/providers/MongoDatabaseProvider';
import {dbConfig} from 'config/db';

export const application = Express();

export const ServiceFactory = (
  service: typeof application,
  options: RoutingControllersOptions,
  port: Number,
) => {
  console.log('--------------------------------------------------------');
  console.log('Initializing service server');
  console.log('--------------------------------------------------------');

  service.use(Express.urlencoded({extended: true}));
  service.use(Express.json());

  console.log('--------------------------------------------------------');
  console.log('Logging and Configuration Setup');
  console.log('--------------------------------------------------------');

  service.use(loggingHandler);

  console.log('--------------------------------------------------------');
  console.log('Define Routing');
  console.log('--------------------------------------------------------');
  service.get('/main/healthcheck', (req, res) => {
    res.send('Hello World');
  });

  console.log('--------------------------------------------------------');
  console.log('Routes Handler');
  console.log('--------------------------------------------------------');
  //After Adding Routes
  if (process.env.NODE_ENV === 'production') {
    Sentry.setupExpressErrorHandler(service);
  }

  console.log('--------------------------------------------------------');
  console.log('Starting Server');
  console.log('--------------------------------------------------------');

  useExpressServer(service, options);

  service.listen(port, () => {
    console.log('--------------------------------------------------------');
    console.log('Started Server at http://localhost:' + port);
    console.log('--------------------------------------------------------');
  });
};

// Create a main function where multiple services are created

useContainer(Container);

if (!Container.has('Database')) {
  Container.set<IDatabase>('Database', new MongoDatabase(dbConfig.url, 'vibe'));
}

import {AbilityBuilder, PureAbility, createMongoAbility} from '@casl/ability';

// // Define allowed actions and subjects
// export type Actions = 'read' | 'create' | 'update' | 'delete' | 'manage'
// export type Subjects = 'Course' | 'all'
// export type Roles = 'admin' | 'student' | 'instructor'

// // Define the shape of an ability rule
// export type AppAbility = PureAbility<[Actions, Subjects]>

// export function defineAbilityFor(role: Roles): AppAbility {
//   const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility)

//   if (role === 'admin') {
//     can('manage', 'all') // Full access
//   }

//   if (role === 'student') {
//     can('read', 'Course')
//   }

//   return build()
// }

// Actions grouped by subject (union of all possible actions)
export type Actions =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'publish'
  | 'submit'
  | 'grade'
  | 'manage'; // general fallback

export type Subjects = 'Course' | 'Module' | 'Assignment' | 'User' | 'all';

type PermissionMap = {
  [role: string]: {
    [subject in Subjects]?: Actions[];
  };
};

export const rolePermissions: PermissionMap = {
  admin: {
    all: ['manage'], // full access
  },
  instructor: {
    Course: ['read', 'update', 'delete'],
    Module: ['create', 'update', 'publish'],
    Assignment: ['grade'],
  },
  student: {
    Course: ['read'],
    Module: ['read'],
    Assignment: ['submit'],
  },
};

export type AppAbility = PureAbility<[Actions, Subjects]>;

export function defineAbilityFor(
  role: keyof typeof rolePermissions,
): AppAbility {
  const {can, build} = new AbilityBuilder<PureAbility<[Actions, Subjects]>>(
    createMongoAbility,
  );

  const permissions = rolePermissions[role];

  if (permissions) {
    for (const subject in permissions) {
      const actions = permissions[subject as Subjects]!;
      actions.forEach(action => {
        can(action, subject as Subjects);
      });
    }
  }

  return build();
}

export const main = () => {
  const student = defineAbilityFor('student');
  const instructor = defineAbilityFor('instructor');

  console.log(
    'Student can submit assignment:',
    student.can('submit', 'Assignment'),
  ); // true
  console.log(
    'Instructor can delete module:',
    instructor.can('delete', 'Module'),
  ); // false
  console.log(
    'Instructor can publish module:',
    instructor.can('publish', 'Module'),
  ); // true

  ServiceFactory(application, coursesModuleOptions, 4001);
};

main();

import { CURRENT_TERM } from "./courseInfo";

export enum Action {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  PREVIEW = 'PREVIEW',
  MUTATE = 'MUTATE',
  INSTRUCTOR_GRADING = 'INSTRUCTOR_GRADING',
  MODERATE = 'MODERATE',

  ACCESS_CONTROL = 'ACCESS_CONTROL',

  APPLY = 'APPLY',
  CREATE_JOB_POST = 'CREATE_JOB_POST',
}

export enum ResourceName {
  BLOG = 'BLOG',
  EXPERIMENTAL = 'EXPERIMENTAL',
  JOB_PORTAL = 'JOB_PORTAL',

  // Resources related to specific courses.
  COURSE_NOTES = 'COURSE_NOTES',
  COURSE_QUIZ = 'COURSE_QUIZ',
  COURSE_COMMENTS = 'COURSE_COMMENTS',
  COURSE_STUDY_BUDDY = 'COURSE_STUDY_BUDDY',
  COURSE_HOMEWORK = 'COURSE_HOMEWORK',

  // Resources related to all courses.
  ALL_COMMENTS = 'ALL_COMMENTS',
  ALL_STUDY_BUDDY = 'ALL_STUDY_BUDDY',

  // For managing access control updates only.
  GLOBAL_ACCESS = 'GLOBAL_ACCESS',
  COURSE_ACCESS = 'COURSE_ACCESS',
}

export enum ComponentType {
  FIXED = 'FIXED',
  VARIABLE = 'VARIABLE',

  WILDCARD1 = 'WILDCARD1',
  WILDCARD2 = 'WILDCARD2',
}

export interface ResourceIdComponent {
  name?: string;
  type: ComponentType;
  value?: string;
}

export interface ResourceType {
  name: ResourceName;
  possibleActions: Action[];
  components: ResourceIdComponent[];
}

export interface ResourceActionPair {
  resourceId: string;
  actionId: string;
}

export const ALL_RESOURCE_TYPES: ResourceType[] = [
  {
    name: ResourceName.BLOG,
    possibleActions: [Action.MUTATE],
    components: [{ type: ComponentType.FIXED, value: 'blog' }],
  },
  {
    name: ResourceName.EXPERIMENTAL,
    possibleActions: [Action.MUTATE],
    components: [{ type: ComponentType.FIXED, value: 'experimental' }],
  },
  {
    name: ResourceName.COURSE_NOTES,
    possibleActions: [Action.MUTATE],
    components: [
      { type: ComponentType.FIXED, value: 'course' },
      { name: 'courseId', type: ComponentType.VARIABLE },
      { type: ComponentType.FIXED, value: 'instance' },
      { name: 'instanceId', type: ComponentType.VARIABLE, value: CURRENT_TERM },
      { type: ComponentType.FIXED, value: 'notes' },
    ],
  },
  {
    name: ResourceName.COURSE_QUIZ,
    possibleActions: [Action.MUTATE, Action.PREVIEW],
    components: [
      { type: ComponentType.FIXED, value: 'course' },
      { name: 'courseId', type: ComponentType.VARIABLE },
      { type: ComponentType.FIXED, value: 'instance' },
      { name: 'instanceId', type: ComponentType.VARIABLE, value: CURRENT_TERM },
      { type: ComponentType.FIXED, value: 'quiz' },
    ],
  },
  {
    name: ResourceName.COURSE_COMMENTS,
    possibleActions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.MODERATE],
    components: [
      { type: ComponentType.FIXED, value: 'course' },
      { name: 'courseId', type: ComponentType.VARIABLE },
      { type: ComponentType.FIXED, value: 'instance' },
      { name: 'instanceId', type: ComponentType.VARIABLE, value: CURRENT_TERM },
      { type: ComponentType.FIXED, value: 'comments' },
    ],
  },
  {
    name: ResourceName.COURSE_STUDY_BUDDY,
    possibleActions: [Action.MODERATE],
    components: [
      { type: ComponentType.FIXED, value: 'course' },
      { name: 'courseId', type: ComponentType.VARIABLE },
      { type: ComponentType.FIXED, value: 'instance' },
      { name: 'instanceId', type: ComponentType.VARIABLE, value: CURRENT_TERM },
      { type: ComponentType.FIXED, value: 'study-buddy' },
    ],
  },
  {
    name: ResourceName.COURSE_HOMEWORK,
    possibleActions: [Action.MUTATE, Action.INSTRUCTOR_GRADING],
    components: [
      { type: ComponentType.FIXED, value: 'course' },
      { name: 'courseId', type: ComponentType.VARIABLE },
      { type: ComponentType.FIXED, value: 'instance' },
      { name: 'instanceId', type: ComponentType.VARIABLE, value: CURRENT_TERM },
      { type: ComponentType.FIXED, value: 'homework' },
    ],
  },
  {
    name: ResourceName.ALL_COMMENTS,
    possibleActions: [Action.MODERATE],
    components: [{ type: ComponentType.FIXED, value: 'comments' }],
  },
  {
    name: ResourceName.ALL_STUDY_BUDDY,
    possibleActions: [Action.MODERATE],
    components: [{ type: ComponentType.FIXED, value: 'study-buddy' }],
  },
  {
    name: ResourceName.GLOBAL_ACCESS,
    possibleActions: [Action.ACCESS_CONTROL],
    components: [{ type: ComponentType.WILDCARD2, value: '**' }],
  },
  {
    name: ResourceName.COURSE_ACCESS,
    possibleActions: [Action.ACCESS_CONTROL],
    components: [
      { type: ComponentType.FIXED, value: 'course' },
      { name: 'courseId', type: ComponentType.VARIABLE },
      { type: ComponentType.FIXED, value: 'instance' },
      { name: 'instanceId', type: ComponentType.VARIABLE, value: CURRENT_TERM },
      { type: ComponentType.WILDCARD2, value: '**' },
    ],
  },
  {
    name: ResourceName.JOB_PORTAL,
    possibleActions: [Action.APPLY, Action.CREATE_JOB_POST],
    components: [
      { type: ComponentType.FIXED, value: 'instance' },
      { name: 'instanceId', type: ComponentType.VARIABLE, value: CURRENT_TERM },
      { type: ComponentType.FIXED, value: 'job-portal' },
    ],
  },

];

export const RESOURCE_TYPE_MAP = new Map<ResourceName, ResourceType>(
  ALL_RESOURCE_TYPES.map((resourceType) => [resourceType.name, resourceType])
);
export function getResourceId(resourceName: ResourceName, variables: Record<string, string>) {
  const resourceType = RESOURCE_TYPE_MAP.get(resourceName);
  if (!resourceType) {
    throw new Error(`Resource type ${resourceName} not found`);
  }
  const components = resourceType.components.map((component) => {
    if (component.type == ComponentType.VARIABLE) {
      const value = variables[component.name!];
      if (!value) {
        throw new Error(`Variable ${component.name} is required but not provided`);
      }
      return value;
    } else if (component.type == ComponentType.WILDCARD1) {
      return '*';
    } else if (component.type == ComponentType.WILDCARD2) {
      return '**';
    } else {
      return component.value;
    }
  });
  return '/' + components.join('/');
}

export function isValidAction(actionId: Action, resourceName: ResourceName) {
  const resourceType = RESOURCE_TYPE_MAP.get(resourceName);
  if (!resourceType) {
    throw new Error(`Resource type ${resourceName} not found`);
  }
  return resourceType.possibleActions.includes(actionId);
}

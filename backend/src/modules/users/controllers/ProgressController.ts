import 'reflect-metadata';
import {
  Authorized,
  Body,
  Get,
  HttpCode,
  JsonController,
  OnUndefined,
  Params,
  Patch,
  Post,
} from 'routing-controllers';
import {Inject, Service} from 'typedi';
import {Progress} from '../classes/transformers';
import {ProgressService} from '../services/ProgressService';
import {
  GetUserProgressParams,
  StartItemParams,
  StartItemBody,
  StartItemResponse,
  StopItemParams,
  StopItemBody,
  UpdateProgressParams,
  UpdateProgressBody,
  ResetCourseProgressParams,
  ResetCourseProgressBody,
  ProgressDataResponse,
} from '../classes/validators';
import {OpenAPI, ResponseSchema} from 'routing-controllers-openapi';
import {BadRequestErrorResponse} from 'shared/middleware/errorHandler';

@JsonController('/users', {transformResponse: true})
@Service()
@OpenAPI({
  tags: ['User Progress'],
})
class ProgressController {
  constructor(
    @Inject('ProgressService')
    private readonly progressService: ProgressService,
  ) {}

  @Get('/:userId/progress/courses/:courseId/versions/:courseVersionId/')
  @HttpCode(200)
  @OpenAPI({
    summary: 'Get User Progress',
    description: "Retrieves a user's progress for a specific course version.",
  })
  @ResponseSchema(ProgressDataResponse, {
    description: 'User progress retrieved successfully',
  })
  @ResponseSchema(BadRequestErrorResponse, {
    description: 'Bad Request Error',
    statusCode: 400,
  })
  async getUserProgress(
    @Params() params: GetUserProgressParams,
  ): Promise<Progress> {
    const {userId, courseId, courseVersionId} = params;

    const progress = await this.progressService.getUserProgress(
      userId,
      courseId,
      courseVersionId,
    );

    return progress;
  }

  @Post('/:userId/progress/courses/:courseId/versions/:courseVersionId/start')
  @HttpCode(200)
  @OpenAPI({
    summary: 'Start Course Item',
    description: "Starts tracking a user's progress on a specific course item.",
  })
  @ResponseSchema(StartItemResponse, {
    description: 'Course item started successfully',
  })
  @ResponseSchema(BadRequestErrorResponse, {
    description: 'Bad Request Error',
    statusCode: 400,
  })
  async startItem(
    @Params() params: StartItemParams,
    @Body() body: StartItemBody,
  ): Promise<StartItemResponse> {
    const {userId, courseId, courseVersionId} = params;
    const {itemId, moduleId, sectionId} = body;

    const watchItemId: string = await this.progressService.startItem(
      userId,
      courseId,
      courseVersionId,
      moduleId,
      sectionId,
      itemId,
    );

    return new StartItemResponse({
      watchItemId,
    });
  }

  @Post('/:userId/progress/courses/:courseId/versions/:courseVersionId/stop')
  @OnUndefined(200)
  @OpenAPI({
    summary: 'Stop Course Item',
    description: "Stops tracking a user's progress on a specific course item.",
  })
  @ResponseSchema(undefined, {
    description: 'Course item stopped successfully',
  })
  @ResponseSchema(BadRequestErrorResponse, {
    description: 'Bad Request Error',
    statusCode: 400,
  })
  async stopItem(
    @Params() params: StopItemParams,
    @Body() body: StopItemBody,
  ): Promise<void> {
    const {userId, courseId, courseVersionId} = params;
    const {itemId, sectionId, moduleId, watchItemId} = body;

    await this.progressService.stopItem(
      userId,
      courseId,
      courseVersionId,
      itemId,
      sectionId,
      moduleId,
      watchItemId,
    );
  }

  @Patch('/:userId/progress/courses/:courseId/versions/:courseVersionId/update')
  @OnUndefined(200)
  @OpenAPI({
    summary: 'Update Progress',
    description: "Updates a user's progress for a specific course item.",
  })
  @ResponseSchema(undefined, {
    description: 'Progress updated successfully',
  })
  @ResponseSchema(BadRequestErrorResponse, {
    description: 'Bad Request Error',
    statusCode: 400,
  })
  async updateProgress(
    @Params() params: UpdateProgressParams,
    @Body() body: UpdateProgressBody,
  ): Promise<void> {
    const {userId, courseId, courseVersionId} = params;
    const {itemId, moduleId, sectionId, watchItemId} = body;

    await this.progressService.updateProgress(
      userId,
      courseId,
      courseVersionId,
      moduleId,
      sectionId,
      itemId,
      watchItemId,
    );
  }

  @Authorized(['admin', 'teacher'])
  @Patch('/:userId/progress/courses/:courseId/versions/:courseVersionId/reset')
  @OnUndefined(200)
  @OpenAPI({
    summary: 'Reset Course Progress',
    description:
      "Resets a user's progress for a course, module, section, or item.",
  })
  @ResponseSchema(undefined, {
    description: 'Progress reset successfully',
  })
  @ResponseSchema(BadRequestErrorResponse, {
    description: 'Bad Request Error',
    statusCode: 400,
  })
  async resetProgress(
    @Params() params: ResetCourseProgressParams,
    @Body() body: ResetCourseProgressBody,
  ): Promise<void> {
    const {userId, courseId, courseVersionId} = params;
    const {moduleId, sectionId, itemId} = body;

    // Check if only moduleId is provided
    // If so, reset progress to the beginning of the module
    if (moduleId && !sectionId && !itemId) {
      await this.progressService.resetCourseProgressToModule(
        userId,
        courseId,
        courseVersionId,
        moduleId,
      );
    }

    // Check if moduleId and sectionId are provided
    // If so, reset progress to the beginning of the section
    else if (moduleId && sectionId && !itemId) {
      await this.progressService.resetCourseProgressToSection(
        userId,
        courseId,
        courseVersionId,
        moduleId,
        sectionId,
      );
    }

    // Check if moduleId, sectionId, and itemId are provided
    // If so, reset progress to the beginning of the item
    else if (moduleId && sectionId && itemId) {
      await this.progressService.resetCourseProgressToItem(
        userId,
        courseId,
        courseVersionId,
        moduleId,
        sectionId,
        itemId,
      );
    }

    // If no moduleId, sectionId, or itemId are provided, reset progress to the beginning of the course
    else {
      await this.progressService.resetCourseProgress(
        userId,
        courseId,
        courseVersionId,
      );
    }
  }
}
export {ProgressController};

import 'reflect-metadata';
import {Get, HttpCode, JsonController, Params} from 'routing-controllers';
import {Inject, Service} from 'typedi';
import {Progress} from '../classes/transformers';
import {IsMongoId, IsNotEmpty, IsString} from 'class-validator';
import {ProgressService} from '../services/ProgressService';

class GetUserProgressParams {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  userId: string;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  courseId: string;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  courseVersionId: string;
}

@JsonController('/users', {transformResponse: true})
@Service()
/**
 * Controller for managing user progress in courses.
 *
 * @category Users/Controllers
 */
class ProgressController {
  constructor(
    @Inject('ProgressService')
    private readonly progressService: ProgressService,
  ) {}

  @Get('/:userId/progress/courses/:courseId/versions/:courseVersionId/')
  @HttpCode(200)
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
}
export {ProgressController};

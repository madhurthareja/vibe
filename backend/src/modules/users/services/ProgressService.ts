import {Inject, Service} from 'typedi';
import {Progress} from '../classes/transformers';
import {ProgressRepository} from 'shared/database/providers/mongo/repositories/ProgressRepository';
import {BadRequestError, NotFoundError} from 'routing-controllers';
import {PromiseOrValue} from 'graphql/jsutils/PromiseOrValue';
import {StartItemBody} from '../controllers';

/**
 * Service for managing user progress in courses.
 *
 * @category Users/Services
 */
@Service()
class ProgressService {
  constructor(
    @Inject('ProgressRepository')
    private readonly progressRepository: ProgressRepository,
  ) {}

  async getUserProgress(
    userId: string,
    courseId: string,
    courseVersionId: string,
  ): Promise<Progress> {
    // Check is userId is valid FirebaseUID

    const progress = await this.progressRepository.findProgress(
      userId,
      courseId,
      courseVersionId,
    );

    if (!progress) {
      throw new NotFoundError('Progress not found');
    }

    return Object.assign(new Progress(), progress);
  }

  async startItem(
    userId: string,
    courseId: string,
    courseVersionId: string,

    body: StartItemBody,
  ): Promise<void> {
    const currentProgress = await this.getUserProgress(
      userId,
      courseId,
      courseVersionId,
    );
    const {itemId, moduleId, sectionId} = body;
    //Check if itemId, moduleId and sectionId are same as currentProgress currentModule, currentSection and currentItem
    if (
      currentProgress.currentItem !== itemId ||
      currentProgress.currentModule !== moduleId ||
      currentProgress.currentSection !== sectionId
    ) {
      throw new BadRequestError(
        'ItemId, moduleId and sectionId do not match current progress',
      );
    }

    // this.progressRepository.startItemTracking(userId, itemId);
  }
}

export {ProgressService};

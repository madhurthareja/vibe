import {Inject, Service} from 'typedi';
import {Progress} from '../classes/transformers';
import {ProgressRepository} from 'shared/database/providers/mongo/repositories/ProgressRepository';
import {NotFoundError} from 'routing-controllers';

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
}

export {ProgressService};

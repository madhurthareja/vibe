import 'reflect-metadata';
import {Collection, ObjectId} from 'mongodb';
import {Inject, Service} from 'typedi';
import {IEnrollment, IProgress} from 'shared/interfaces/IUser';
import {
  CreateError,
  ItemNotFoundError,
  ReadError,
  UpdateError,
} from 'shared/errors/errors';
import {MongoDatabase} from '../MongoDatabase';

type CurrentProgress = Pick<
  IProgress,
  'currentModule' | 'currentSection' | 'currentItem' | 'completed'
>;

@Service()
class ProgressRepository {
  private progressCollection: Collection<IProgress>;

  constructor(@Inject(() => MongoDatabase) private db: MongoDatabase) {}

  private async init() {
    this.progressCollection =
      await this.db.getCollection<IProgress>('progress');
  }

  /**
   * Find a progress record by useerId, courseId, and courseVersionId
   * @param userId - The ID of the user
   * @param courseId - The ID of the course
   * @param courseVersionId - The ID of the course version
   * @returns The progress record if found, or null if not found
   */
  async findProgress(
    userId: string,
    courseId: string,
    courseVersionId: string,
  ): Promise<IProgress | null> {
    await this.init();
    return await this.progressCollection.findOne({
      userId: new ObjectId(userId),
      courseId: new ObjectId(courseId),
      courseVersionId: new ObjectId(courseVersionId),
    });
  }

  /**
   * Find a progress record by ID
   * @param id - The ID of the progress record
   * @returns The progress record if found, or null if not found
   */
  async findById(id: string): Promise<IProgress | null> {
    await this.init();
    return await this.progressCollection.findOne({_id: new ObjectId(id)});
  }

  /**
   * Update an existing progress record
   */
  async updateProgress(
    userId: string,
    courseId: string,
    courseVersionId: string,
    progress: Partial<CurrentProgress>,
  ): Promise<IProgress | null> {
    await this.init();
    try {
      const result = await this.progressCollection.findOneAndUpdate(
        {
          userId: userId,
          courseId: new ObjectId(courseId),
          courseVersionId: new ObjectId(courseVersionId),
        },
        {$set: progress},
        {returnDocument: 'after'},
      );

      if (!result._id) {
        throw new ItemNotFoundError('Progress not found');
      }

      return result;
    } catch (error) {
      throw new UpdateError(
        `Failed to update progress tracking: ${error.message}`,
      );
    }
  }

  /**
   * Create a new progress tracking record
   */
  async createProgress(progress: IProgress): Promise<IProgress> {
    await this.init();
    try {
      const result = await this.progressCollection.insertOne(progress);
      if (!result.acknowledged) {
        throw new CreateError('Failed to create progress record');
      }

      const newProgress = await this.progressCollection.findOne({
        _id: result.insertedId,
      });

      if (!newProgress) {
        throw new ItemNotFoundError('Newly created progress not found');
      }

      return newProgress;
    } catch (error) {
      throw new CreateError(
        `Failed to create progress tracking: ${error.message}`,
      );
    }
  }
}

export {ProgressRepository};

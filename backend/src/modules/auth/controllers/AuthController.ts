/**
 * @file AuthController.ts
 * @description Controller managing authentication-related routes.
 * @module auth
 *
 * @author Aditya BMV
 * @organization DLED
 * @license MIT
 * @created 2025-03-06
 */

import 'reflect-metadata';
import {
  JsonController,
  Post,
  Body,
  Authorized,
  Req,
  Patch,
  HttpError,
} from 'routing-controllers';
import {Inject, Service} from 'typedi';
import {AuthenticatedRequest, IAuthService} from '../interfaces/IAuthService';
import {instanceToPlain} from 'class-transformer';
import {ChangePasswordError} from '../services/FirebaseAuthService';
import {ChangePasswordBody, SignUpBody} from '../classes/validators';

@JsonController('/auth')
@Service()

/**
 * AuthController handles authentication-related routes.
 * It provides endpoints for user signup, password change, and token verification.
 * @group Auth
 */
export class AuthController {
  /**
   * Constructs the AuthController with the required AuthService.
   * @param authService - Service responsible for authentication logic.
   */
  constructor(
    @Inject('AuthService') private readonly authService: IAuthService,
  ) {}

  /**
   * Handles user signup requests.
   *
   * @param body - User signup details validated via DTOSignUp.
   * @returns Plain object representation of the newly created user.
   */
  @Post('/signup')
  async signup(@Body() body: SignUpBody) {
    const user = await this.authService.signup(body);
    return instanceToPlain(user);
  }

  /**
   * Handles user password change requests.
   *
   * Authorized for roles: admin, teacher, student.
   *
   * @param body - Details required to change user password.
   * @param request - Authenticated request containing the user.
   * @returns Confirmation message upon successful password change.
   * @throws `HttpError` - On business logic errors or unexpected server errors.
   */
  @Authorized(['admin', 'teacher', 'student'])
  @Patch('/change-password')
  async changePassword(
    @Body() body: ChangePasswordBody,
    @Req() request: AuthenticatedRequest,
  ) {
    try {
      const result = await this.authService.changePassword(body, request.user);
      return {success: true, message: result.message};
    } catch (error) {
      if (error instanceof ChangePasswordError) {
        throw new HttpError(400, error.message);
      }
      if (error instanceof Error) {
        throw new HttpError(500, error.message);
      }
      throw new HttpError(500, 'Internal server error');
    }
  }

  /**
   * Verifies validity of the user's token.
   *
   * Authorized for admin users only.
   *
   * @returns Confirmation message if token is valid.
   */
  @Authorized(['admin'])
  @Post('/verify')
  async verifyToken() {
    return {
      message: 'Token is valid',
    };
  }
}

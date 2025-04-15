/**
 * @file IAuthService.ts
 * @description Interfaces for the authentication service.
 * @module auth
 *
 * @author Aditya BMV
 * @organization DLED
 * @license MIT
 * @created 2025-03-06
 */

import 'reflect-metadata';
import {Request} from 'express';
import {IUser} from 'shared/interfaces/IUser';
import {
  ChangePasswordBody,
  SignUpBody,
} from '../classes/validators/AuthValidators';

/**
 * Interface representing the authentication service.
 */
export interface IAuthService {
  /**
   * Signs up a new user.
   *
   * @param body - The payload containing the sign-up information.
   * @returns A promise that resolves to the created user.
   */
  signup(body: SignUpBody): Promise<IUser>;

  /**
   * Verifies a given token.
   *
   * @param token - The token to verify.
   * @returns A promise that resolves to the user associated with the token.
   */
  verifyToken(token: string): Promise<IUser>;

  /**
   * Changes the password of a user.
   *
   * @param body - The payload containing the new password information.
   * @param requestUser - The user requesting the password change.
   * @returns A promise that resolves to a confirmation string.
   */
  changePassword(
    body: ChangePasswordBody,
    requestUser: IUser,
  ): Promise<{success: boolean; message: string}>;
}

/**
 * Represents an authenticated HTTP request.
 *
 * Extends Express's standard Request object to include
 * user information associated with the authenticated session.
 *
 * This interface helps controllers access the currently authenticated user directly.
 *
 * The `authorizationChecker` function configured in Routing Controllers Options
 * from the `routing-controllers` package populates the `user` property.
 */
export interface AuthenticatedRequest extends Request {
  /**
   * The authenticated user making the request.
   */
  user: IUser;
}

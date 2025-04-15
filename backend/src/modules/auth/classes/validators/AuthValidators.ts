import {
  IsAlpha,
  IsEmail,
  IsNotEmpty,
  Matches,
  MinLength,
} from 'class-validator';

/**
 * Payload for the sign-up process.
 */
class SignUpBody {
  /**
   * The email of the user.
   */
  @IsEmail()
  email: string;

  /**
   * The password of the user.
   */
  @IsNotEmpty()
  @MinLength(8)
  password: string;
  /**
   * The first name of the user.
   */

  @IsAlpha()
  firstName: string;

  /**
   * The last name of the user.
   */
  @IsAlpha()
  lastName: string;
}

/**
 * Payload for changing the user's password.
 */
class ChangePasswordBody {
  /**
   * The new password to be set.
   */
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.',
    },
  )
  newPassword: string;

  /**
   * Confirmation of the new password.
   */
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.',
    },
  )
  newPasswordConfirm: string;
}

export {SignUpBody, ChangePasswordBody};

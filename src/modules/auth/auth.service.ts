import { AppError } from '../../common/errors/app-error.js';
import { refreshTokenRepository } from '../../database/repositories/refresh-token.repository.js';
import { userRepository } from '../../database/repositories/user.repository.js';
import type { UserRow } from '../../database/types.js';
import { authzService } from './authz.service.js';
import { hashPassword, verifyPassword } from './password.js';
import {
  generateRefreshToken,
  getRefreshTokenExpirationDate,
  hashRefreshToken,
  signAccessToken,
} from './token.js';

type RegisterInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

type LoginInput = {
  email: string;
  password: string;
};

async function toAuthUser(user: UserRow) {
  return await authzService.buildAuthUser(user);
}

async function issueAuthTokens(user: UserRow) {
  const authUser = await toAuthUser(user);

  const accessToken = signAccessToken(authUser);
  const rawRefreshToken = generateRefreshToken();
  const refreshTokenHash = hashRefreshToken(rawRefreshToken);
  const refreshTokenExpiresAt = getRefreshTokenExpirationDate();

  await refreshTokenRepository.create({
    user_id: user.id,
    token_hash: refreshTokenHash,
    expires_at: refreshTokenExpiresAt,
    revoked_at: null,
  });

  return {
    accessToken,
    rawRefreshToken,
    user: {
      id: user.id,
      email: user.email,
      roles: authUser.roles,
      permissions: authUser.permissions,
      firstName: user.first_name,
      lastName: user.last_name,
    },
  };
}

export const authService = {
  async register(input: RegisterInput) {
    const emailExists = await userRepository.emailExists(input.email);

    if (emailExists) {
      throw new AppError({
        message: 'Email already exists',
        statusCode: 409,
        code: 'EMAIL_ALREADY_IN_USE',
      });
    }

    const passwordHash = await hashPassword(input.password);

    const user = await userRepository.create({
      email: input.email,
      password_hash: passwordHash,
      first_name: input.firstName,
      last_name: input.lastName,
      is_active: true,
    });

    return await issueAuthTokens(user);
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);

    if (!user) {
      throw new AppError({
        message: 'Invalid email or password',
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
      });
    }

    if (!user.is_active) {
      throw new AppError({
        message: 'User account is inactive',
        statusCode: 403,
        code: 'USER_INACTIVE',
      });
    }

    const isPasswordValid = await verifyPassword(input.password, user.password_hash);

    if (!isPasswordValid) {
      throw new AppError({
        message: 'Invalid email or password',
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
      });
    }

    return await issueAuthTokens(user);
  },

  async refresh(refreshToken: string) {
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const storedToken = await refreshTokenRepository.findByTokenHash(refreshTokenHash);

    if (!storedToken) {
      throw new AppError({
        message: 'Invalid refresh token',
        statusCode: 401,
        code: 'INVALID_REFRESH_TOKEN',
      });
    }

    if (storedToken.revoked_at) {
      throw new AppError({
        message: 'Refresh token has been revoked',
        statusCode: 401,
        code: 'REFRESH_TOKEN_REVOKED',
      });
    }

    if (new Date(storedToken.expires_at) < new Date()) {
      throw new AppError({
        message: 'Refresh token has expired',
        statusCode: 401,
        code: 'REFRESH_TOKEN_EXPIRED',
      });
    }

    const user = await userRepository.findById(storedToken.user_id);

    if (!user || !user.is_active) {
      throw new AppError({
        message: 'User is not available',
        statusCode: 401,
        code: 'USER_NOT_AVAILABLE',
      });
    }

    await refreshTokenRepository.revokeById(storedToken.id);

    return await issueAuthTokens(user);
  },

  async getCurrentUser(userId: string) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError({
        message: 'User not found',
        statusCode: 404,
        code: 'USER_NOT_FOUND',
      });
    }

    if (!user.is_active) {
      throw new AppError({
        message: 'User account is inactive',
        statusCode: 403,
        code: 'USER_INACTIVE',
      });
    }

    const authUser = await authzService.buildAuthUser(user);

    return {
      id: user.id,
      email: user.email,
      roles: authUser.roles,
      permissions: authUser.permissions,
      firstName: user.first_name,
      lastName: user.last_name,
    };
  },
};

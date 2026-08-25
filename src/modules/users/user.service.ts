import { AppError } from '../../common/errors/app-error.js';
import { userRepository } from '../../database/repositories/user.repository.js';
import { roleRepository } from '../../database/repositories/role.repository.js';
import { userRoleRepository } from '../../database/repositories/user-role.repository.js';
import { hashPassword } from '../auth/password.js';

type CreateUserInput = {
  email: string;
  password: string;
  roles: string[];
  first_name: string;
  last_name: string;
};

export const userService = {
  async create(input: CreateUserInput) {
    const emailExists = await userRepository.emailExists(input.email);

    if (emailExists) {
      throw new AppError({
        message: 'Email already in use',
        statusCode: 409,
        code: 'EMAIL_ALREADY_IN_USE',
      });
    }

    const passwordHash = await hashPassword(input.password);

    const user = await userRepository.create({
      email: input.email,
      password_hash: passwordHash,
      first_name: input.first_name,
      last_name: input.last_name,
      is_active: true,
    });

    const roles = await roleRepository.findByKeys(input.roles);
    const roleIds = roles.map((role) => role.id);

    await userRoleRepository.replaceRoles(user.id, roleIds);

    return {
      id: user.id,
      email: user.email,
      roles: roles.map((role) => role.key),
      firstName: user.first_name,
      lastName: user.last_name,
      isActive: user.is_active,
    };
  },

  async getById(id: string) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new AppError({
        message: 'User not found',
        statusCode: 404,
        code: 'USER_NOT_FOUND',
      });
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      isActive: user.is_active,
    };
  },
};

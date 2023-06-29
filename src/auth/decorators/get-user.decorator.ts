import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';

export const GetUser = createParamDecorator((data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;

  if (!user) {
    throw new InternalServerErrorException('User not found');
  }

  if (data) {
    return user[data] || '';
  }

  return user;
});

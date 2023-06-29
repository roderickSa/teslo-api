import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GetHeaders = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers;
  },
);

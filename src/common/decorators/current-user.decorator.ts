import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { CurrentUserInterface } from '../interfaces/current-user.interface';

export const CurrentUser = createParamDecorator(
  (
    data: keyof CurrentUserInterface | undefined,
    context: ExecutionContext,
  ):
    | CurrentUserInterface
    | CurrentUserInterface[keyof CurrentUserInterface] => {
    const request = context.switchToHttp().getRequest<{
      user: CurrentUserInterface;
    }>();

    if (!data) {
      return request.user;
    }

    return request.user[data];
  },
);

import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from 'src/auth/decorators/role-protected.decorator';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ValidRoles: string[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    );

    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    if (!user) {
      throw new BadRequestException(`The user does not exist.`);
    }

    for (const role of user.roles) {
      if (ValidRoles.includes(role)) {
        return true;
      }
    }

    throw new ForbiddenException(
      `User ${user.firstName} ${user.lastName} not authorized to do this action`,
    );
  }
}

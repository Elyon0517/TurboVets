import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IJwtPayload } from '@org/data';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditLog');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as IJwtPayload | undefined;
    const { method, url, ip } = request as { method: string; url: string; ip: string };
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const elapsed = Date.now() - start;
          this.logger.log(
            `${method} ${url} | user=${user?.email ?? 'anonymous'} | ${elapsed}ms | IP=${ip}`,
          );
        },
        error: (err: { status?: number }) => {
          const elapsed = Date.now() - start;
          this.logger.warn(
            `${method} ${url} | user=${user?.email ?? 'anonymous'} | ${elapsed}ms | IP=${ip} | ERROR ${err?.status ?? 500}`,
          );
        },
      }),
    );
  }
}

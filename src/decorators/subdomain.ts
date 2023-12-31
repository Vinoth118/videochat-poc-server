import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { getSubdomain } from "tldts";

export type SubDomain = 'vijayy' | 'vinothh';

export const Subdomain = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const subdomain = getSubdomain(request.headers.origin);
    return subdomain ?? 'vijayy';
  },
);
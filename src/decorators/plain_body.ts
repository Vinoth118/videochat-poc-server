import { BadRequestException, createParamDecorator, ExecutionContext } from "@nestjs/common";
var rawbody = require('raw-body')

export const PlainBody = createParamDecorator(async (_, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest<import("express").Request>();
  if (!req.readable) { throw new BadRequestException("Invalid body"); }
  const body = (await rawbody(req)).toString("utf8").trim();
  return JSON.parse(body);
})
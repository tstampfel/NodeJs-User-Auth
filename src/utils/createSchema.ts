import { buildSchema } from "type-graphql";
import { AuthResolver } from "../modules/auth/auth.resolver";
import Container from "typedi";
import { authChecker } from "./authChecker";
import { redisPubsub } from "./../redis";

export const createSchema = async () =>
  buildSchema({
    resolvers: [AuthResolver],
    container: Container,
    pubSub: redisPubsub,
    authChecker,
  });

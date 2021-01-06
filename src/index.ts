import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import Express from "express";
import { createSchema } from "./utils/createSchema";
import { createMongooseConnection } from "./db/mongoose";
import connectRedis from "connect-redis";
import session from "express-session";
import { redis } from "./redis";
import http from "http";

const main = async () => {
  await createMongooseConnection();
  const schema = await createSchema();

  const RedisStore = connectRedis(session);

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }: any) => ({
      req,
      res,
    }),
    subscriptions: {
      onConnect: () => console.log("Connected to websocket"),
    },
  });

  const app = Express();

  app.use(
    session({
      store: new RedisStore({
        client: redis as any,
      }),
      name: process.env.REDIS_SESSION_NAME,
      secret: process.env.REDIS_SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
    })
  );

  apolloServer.applyMiddleware({ app, cors: false });

  const httpServer = http.createServer(app);
  apolloServer.installSubscriptionHandlers(httpServer);

  httpServer.listen(process.env.PORT || 4000, () => {
    console.log(`Server ready at http://localhost:4000${apolloServer.graphqlPath}`);
    console.log(`Subscriptions ready at ws://localhost:4000${apolloServer.subscriptionsPath}`);
  });
};

main().catch((err) => console.error(err));

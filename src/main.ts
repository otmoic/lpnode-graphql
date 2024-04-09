const fs = require("fs");
const path = require("path");
const envFile = fs.existsSync(path.join(__dirname, "env.js"));
const _ = require("lodash")
if (envFile) {
  require("./env.js");
} else {
  console.log("env file does not exist");
}

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";

import express from "express";
import http from "http";
import { json } from "body-parser";
import cors from "cors";

import { appEnv } from "./app_env"; // this should be at the very beginning
appEnv.initConfig(); // initialize basic configuration

import { schemas_resolvers, schemas_typeDefs } from "./schemas";

import { Mdb } from "./module/database/mdb";
import { logger } from "./sys_lib/logger";

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const app = express();
const httpServer = http.createServer(app);
console.log(schemas_typeDefs, typeof schemas_typeDefs);
const server = new ApolloServer({
  typeDefs: schemas_typeDefs,
  resolvers: schemas_resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
async function main() {
  Mdb.getInstance().getMongoDb("main"); // initialize database connection
  Mdb.getInstance().getMongoDb("business");
  const wait = 2;
  let connected = 0;

  Mdb.getInstance()
    .awaitDbConn("main")
    .then(() => {
      connected = connected + 1;
    });
  Mdb.getInstance()
    .awaitDbConn("business")
    .then(() => {
      connected = connected + 1;
    });
  await (() => {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (connected === wait) {
          logger.debug(`all connections successful....`);
          resolve(true);
          if (connected) {
            clearInterval(interval);
          }
        }
      }, 20);
    });
  })();
  logger.debug(`database connection ready...`, "..");
  logger.debug(`start server`);
  await server.start();
  const domainHttps = `https://${_.get(process.env, "WEB_DOMAIN", "")}`
  const domainHttp = `http://${_.get(process.env, "WEB_DOMAIN", "")}`
  app.use(
    "/graphql",
    cors<cors.CorsRequest>({
      origin: [
        domainHttps,
        domainHttp,
      ],
    }),
    json(),
    expressMiddleware(server)
  );
  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 4000 }, resolve)
  );
  console.log("cors")
  console.log(domainHttps)
  console.log(domainHttp)
  console.log(`🚀 Server ready at http://localhost:4000/graphql`);
}
main().then(() => {
  console.log(`program successfully started`);
});

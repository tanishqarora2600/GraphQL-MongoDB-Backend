import express from "express";
import mongoose from "mongoose";
import { ApolloServer, gql } from "apollo-server-express";
import { resolvers } from "./resolvers";
import { typeDefs } from "./typeDefs";

var admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "",
});

const startServer = async () => {
  const app = express();

  app.use(isAuth);
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => ({
      req,
      res,
    }),
    playground: true,
    introspection: true,
  });
//server middleware
  server.applyMiddleware({
    app,
  });
  
  
  try {
    await mongoose.connect(
      "",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
  } catch (error) {
    console.log(error);
  }

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log("connected");
  });
};

startServer();

import {onRequest} from "firebase-functions/v2/https";
import {logger} from "firebase-functions";

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello World function called!", {structuredData: true});
  response.json({message: "Hello from Firebase Functions!"});
});
import { tql } from "./converter";
import { promises as fs } from "fs";

const graphqlFolder = "./graphql/";

async function createGraphqlFolder(): Promise<void> {
  if (!!!(await fs.stat(graphqlFolder).catch((e: Error) => false))) {
    await fs.mkdir(graphqlFolder);
  }
}

async function createGraphQLFilesForEachTypeQlFile(): Promise<void> {
  // create graphql folder if not exists
  await createGraphqlFolder();
  // read all files in tql folder
  const folder = await fs.readdir("./tql");
  // for each tql file run the converter
  folder.forEach((file) => file.endsWith(".tql") && tql(file));
}

createGraphQLFilesForEachTypeQlFile();

import { tql } from "./converter";
import { promises as fs } from "fs";
import path from "path";
import process from "process";

// const graphqlFolder = path.relative(process.cwd(), "./graphql/";
const graphqlFolder = "./graphql";
const typingsFolder = "./typings";

async function createFolders(): Promise<void> {
  for (const folder of [graphqlFolder, typingsFolder]) {
    if (!!!(await fs.stat(folder).catch((e: Error) => false))) {
      await fs.mkdir(folder);
    }
  }
}

async function createGraphQLFilesForEachTypeQlFile(): Promise<void> {
  // create graphql and typings folder if not exists
  await createFolders();
  // read all files in tql folder
  const folder = await fs.readdir("./typeql");
  // for each tql file run the converter
  folder.forEach((file) => file.endsWith(".typeql") && tql(file));
}

createGraphQLFilesForEachTypeQlFile();

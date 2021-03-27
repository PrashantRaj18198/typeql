import { typeql } from "./converter";
import { promises as fs } from "fs";
import { settings, pickSettingsFromTypeqlConfig } from "./settings";

console.log("settings data from index", settings);

async function createFolders(): Promise<void> {
  console.log("inside createfolder", settings);
  for (const folder of [settings.graphqlDir, settings.typingsDir]) {
    // console.log(folder);
    if (!!!(await fs.stat(folder).catch((e: Error) => false))) {
      await fs.mkdir(folder).catch((e: Error) => console.log(e.message));
    }
  }
}

async function createGraphQLFilesForEachTypeQlFile(): Promise<void> {
  await pickSettingsFromTypeqlConfig();
  // create graphql and typings folder if not exists
  await createFolders();
  // read all files in typeql folder
  const folder = await fs.readdir("./typeql");
  // for each typeql file run the converter
  folder.forEach((file) => file.endsWith(".typeql") && typeql(file));
}

createGraphQLFilesForEachTypeQlFile();

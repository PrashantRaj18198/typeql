import { typeql } from "./converter";
import { promises as fs } from "fs";
import { settings, pickSettingsFromTypeqlConfig } from "./settings";
import { inherits } from "node:util";

// console.log("settings data from index", settings);

/**
 * create the folder for typingsDir and graphqlDir if not present
 */
async function createFolders(): Promise<void> {
  for (const folder of [settings.graphqlDir, settings.typingsDir]) {
    if (!!!(await fs.stat(folder).catch((e: Error) => false))) {
      await fs.mkdir(folder).catch((e: Error) => console.log(e.message));
    }
  }
}

async function createGraphQLFilesForEachTypeQlFile(): Promise<void> {
  // read all files in typeql folder
  const folder = await fs.readdir(settings.typeqlDir);
  // for each typeql file run the converter
  folder.forEach((file) => file.endsWith(".typeql") && typeql(file));
}

/**
 * initialize all the necessary parts
 */
async function init(): Promise<void> {
  await pickSettingsFromTypeqlConfig();
  await createFolders();
}
init();
createGraphQLFilesForEachTypeQlFile();

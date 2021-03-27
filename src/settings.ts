import fs from "fs/promises";
import path from "path";
import process from "process";

export type SettingsKeyType = "graphqlDir" | "typingsDir" | "typeqlDir";

export const settings: Record<SettingsKeyType, string> = {
  graphqlDir: path.resolve(process.cwd(), "./graphql"),
  typingsDir: path.resolve(process.cwd(), "./typings"),
  typeqlDir: path.resolve(process.cwd(), "./typeql"),
};

export async function pickSettingsFromTypeqlConfig() {
  // the location of typeql file
  const typeqlConfigLocation = path.resolve(process.cwd(), "typeql.json");
  try {
    // read data from config, if it doesn't exist error out and
    // catch the error
    const data = JSON.parse(await fs.readFile(typeqlConfigLocation, "utf-8"));
    console.log("data from json", data);
    Object.keys(data).map(
      (key) =>
        (settings[key as SettingsKeyType] = path.resolve(
          process.cwd(),
          data[key]
        ))
    );
    console.log("data after change", settings);
  } catch (error) {
    console.log(error);
  }
}
console.log(settings);

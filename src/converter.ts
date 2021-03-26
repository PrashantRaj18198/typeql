const fs = require("fs").promises;
export async function tql(): Promise<void> {
  try {
    const data = await fs.readFile("tql/query-basic.tql");
    // console.log(Buffer.from(data).toString());
    let query = Buffer.from(data, "utf-8").toString();
    query = query.replace(/:.*(?<!{)/gm, " ");
    query = query.replace("]", "");
    await fs.writeFile("query-basic.graphql", query);
  } catch (error) {
    console.log(error);
  }
}

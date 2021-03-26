const fs = require("fs").promises;
/**
 * @todo handle variables in query. This can be done by ignoring everyting
 * inside parantheses `()`.
 * @todo provide typings for the query result in a .ts file
 * @todo provide typings for the variables in a .ts file
 */
export async function tql(): Promise<void> {
  try {
    const data = await fs.readFile("tql/query-basic.tql");
    // convert file data to utf-8 and a string
    let query = Buffer.from(data, "utf-8").toString();
    /**
     * replace everything after a : till the end of line `$` or till you find a
     * `{` character. This will also remove `[` since `[` always comes before a
     * `{`. Check query-basic.tql (line 4)
     */
    query = query.replace(/:.*(?<!{)/gm, " ");
    /**
     * remove the `]` character from the query
     */
    query = query.replace("]", "");
    /**
     * write the query to a .graphql file with the same name
     */
    await fs.writeFile("query-basic.graphql", query);
  } catch (error) {
    console.log(error);
  }
}

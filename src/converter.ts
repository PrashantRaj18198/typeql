const graphqlFolder = "./graphql/";
// const fileName = `query-with-variables`;
const fs = require("fs").promises;
/**
 * @todo provide typings for the query result in a .ts file
 * @todo provide typings for the variables in a .ts file
 */
export async function tql(fileNameWithEnding: string): Promise<void> {
  // remove the .tql from the fileName passed
  const fileName = fileNameWithEnding.split(".")[0];
  try {
    console.log("running tql converter");
    // read data from tql file
    const data = await fs.readFile(`tql/${fileName}.tql`);
    // convert file data to utf-8 and a string
    let query = Buffer.from(data, "utf-8").toString();
    /**
     * we don't need to make changes to anything inside the `(.....)` so match
     * everything till the last `)` as position say `x` and slice till this
     * posiion `x`, and keep in slicedQuery as we don't need to remove typings
     * from this part.
     */
    let slicedQuery = "";
    /**
     * parantheses matcher. Matches everything till the last `)` character found
     * Since we only support one query per file this should be okay to do.
     * @todo allow multiple queries.
     */
    const matchParanthesesRegex = /\((.|\n)*\)/gm;
    const match = matchParanthesesRegex.exec(query);
    console.log("matched @", match && match?.index + match[0].length);
    /**
     * if match is found, i.e., variables are part of this query we can slice it
     * and keep it seperate. otherwise its just an empty string
     */
    if (match) {
      slicedQuery = query.slice(0, match.index + match[0].length);
      console.log("slicedQuery", slicedQuery, "\n\n");
      query = query.slice(match.index + match[0].length);
      console.log("query", query, "\n\n");
    }

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
     * merge the queries.
     */
    query = slicedQuery + query;
    console.log("output", query);

    /**
     * write the query to a .graphql file with the same name
     */
    await fs.writeFile(`${graphqlFolder}/${fileName}.graphql`, query);
  } catch (error) {
    console.log(error);
  }
}

// async function removeMatchFromQuery(
//   query: string,
//   removeTill: number
// ): string {}

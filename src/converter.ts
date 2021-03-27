const graphqlFolder = "./graphql/";
const fileName = `query-with-variables`;
const fs = require("fs").promises;
/**
 * @todo handle variables in query. This can be done by ignoring everyting
 * inside parantheses `()`.
 * @todo provide typings for the query result in a .ts file
 * @todo provide typings for the variables in a .ts file
 */
export async function tql(): Promise<void> {
  try {
    await createGraphqlFolder();
    console.log("running tql converter");
    const data = await fs.readFile(`tql/${fileName}.tql`);
    // convert file data to utf-8 and a string
    let query = Buffer.from(data, "utf-8").toString();
    let slicedQuery = "";
    let m;
    const matchParanthesesRegex = /\((.|\n)*\)/gm;
    const match = matchParanthesesRegex.exec(query);
    console.log("matched @", match && match?.index + match[0].length);
    if (match) {
      slicedQuery = query.slice(0, match.index + match[0].length);
      console.log("slicedQuery", slicedQuery, "\n\n");
      query = query.slice(match.index + match[0].length);
      console.log("query", query, "\n\n");
    }
    // console.log("matches", matches);
    // matches?.forEach((match, groupIndex) => {
    //   console.log(`Found match, group ${groupIndex}: ${match}: ${match}`);
    // });
    // while ((m = matchParanthesesRegex.exec(query)) !== null) {
    //   // This is necessary to avoid infinite loops with zero-width matches
    //   if (m.index === matchParanthesesRegex.lastIndex) {
    //     matchParanthesesRegex.lastIndex++;
    //   }

    //   // The result can be accessed through the `m`-variable.
    //   m.forEach((match, groupIndex) => {
    //     console.log(`Found match, group ${groupIndex}: ${match}`);
    //   });
    // }
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

async function createGraphqlFolder(): Promise<void> {
  if (!!!(await fs.stat(graphqlFolder).catch((e: Error) => false))) {
    await fs.mkdir(graphqlFolder);
  }
}

// async function removeMatchFromQuery(
//   query: string,
//   removeTill: number
// ): string {}

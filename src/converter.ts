export interface IStringObject {
  [key: string]: string;
}

const definations: IStringObject = {
  String: "string",
  Int: "number",
};

const graphqlFolder = "./graphql/";
const typingsFolder = "./typings";
// const fileName = `query-with-variables`;
const fs = require("fs").promises;
/**
 * @todo provide typings for the query result in a .ts file
 * @todo provide typings for the variables in a .ts file
 */
export async function tql(fileNameWithEnding: string): Promise<void> {
  // remove the .typeql from the fileName passed
  const fileName = fileNameWithEnding.split(".")[0];
  try {
    console.log("running tql converter");
    // read data from tql file
    const data = await fs.readFile(`typeql/${fileName}.typeql`);
    // convert file data to utf-8 and a string
    let query = Buffer.from(data, "utf-8").toString();
    /**
     * we don't need to make changes to anything inside the `(.....)` so match
     * everything till the last `)` as position say `x` and slice till this
     * posiion `x`, and keep in slicedQuery as we don't need to remove typings
     * from this part.
     */
    let slicedQuery = "";
    let variableTyping: string | undefined = undefined;
    /**
     * parantheses matcher. Matches everything till the last `)` character found
     * Since we only support one query per file this should be okay to do.
     * @todo allow multiple queries.
     */
    const matchParanthesesRegex = /\((.|\n)*\)/gm;
    const match = matchParanthesesRegex.exec(query);
    // console.log("matched @", match && match?.index + match[0].length);
    /**
     * if match is found, i.e., variables are part of this query we can slice it
     * and keep it seperate. otherwise its just an empty string
     */
    if (match) {
      slicedQuery = query.slice(0, match.index + match[0].length);
      // console.log("slicedQuery", slicedQuery, "\n\n");
      query = query.slice(match.index + match[0].length);
      // console.log("query", query, "\n\n");
    }

    /**
     *
     */
    if (slicedQuery !== "") {
      variableTyping = await generateVariableTyping(slicedQuery);
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
    // console.log("output", query);

    /**
     * write the query to a .graphql file with the same name
     */
    await fs.writeFile(`${graphqlFolder}/${fileName}.graphql`, query);
    if (variableTyping) {
      await fs.writeFile(`${typingsFolder}/${fileName}.ts`, variableTyping);
    }
  } catch (error) {
    console.log(error);
  }
}

// async function removeMatchFromQuery(
//   query: string,
//   removeTill: number
// ): string {}

async function generateVariableTyping(slicedQuery: string) {
  const varaiblesStringArray: string[] = [];
  let start = 0,
    end = 0;
  for (let index = 0; index < slicedQuery.length; index++) {
    if (start !== 0 && end !== 0) {
      break;
    }
    if (slicedQuery[index] === "(") {
      start = index;
    } else if (slicedQuery[index] === ")") {
      end = index;
    } else if (start > 0) {
      /**
       * only add to array if the current character not in array
       */
      if (["$"].indexOf(slicedQuery[index]) === -1) {
        varaiblesStringArray.push(slicedQuery[index]);
      }
    }
  }
  // console.log("variables string", slicedQuery.slice(start, end + 1));
  const variablesString = varaiblesStringArray.join("");
  console.log("variables string", varaiblesStringArray.join(""));
  variablesString.split(",");
  console.log(variablesString.split(","));
  const resultVariablesTypeObject: IStringObject = {};
  // return variablesString;
  for (const variableLine of variablesString.split(",")) {
    const [variable, type] = variableLine
      .split(":")
      .map((variable) => variable.trim());
    if (type[type.length - 1] === "!") {
      resultVariablesTypeObject[variable] =
        definations[type.slice(0, type.length - 1)];
    } else {
      resultVariablesTypeObject[variable] =
        (definations[type] as string) + " | undefined";
    }
  }
  const stringifiedVariableType =
    "export interface IVariables " +
    JSON.stringify(resultVariablesTypeObject, null, 4).replace(/\"/g, "");
  console.log(
    resultVariablesTypeObject,
    JSON.stringify(resultVariablesTypeObject, null, 4)
  );
  console.log(stringifiedVariableType);
  return stringifiedVariableType;
}

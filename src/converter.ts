import { settings } from "./settings";
export interface IStringObject {
  [key: string]: string;
}

const definations: IStringObject = {
  String: "string",
  Int: "number",
};

// const fileName = `query-with-variables`;
const fs = require("fs").promises;
/**
 * @todo provide typings for the query result in a .ts file
 * @todo provide typings for the variables in a .ts file
 */
export async function typeql(fileNameWithEnding: string): Promise<void> {
  // remove the .typeql from the fileName passed
  const fileName = fileNameWithEnding.split(".")[0];
  try {
    // console.log("running tql converter");
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
    let variableTyping: string = "";
    let resultTyping: string = "";

    resultTyping = generateResultTyping(query);
    console.log(resultTyping);
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
     * if there is slicedQuery, i.e, variables are present then generate
     * typings for the variables
     */
    if (slicedQuery !== "") {
      variableTyping = await generateVariableTyping(slicedQuery);
    }

    /**
     * replace everything after a : till the end of line `$` or till you find a
     * `{` character. This will also remove `[` since `[` always comes before a
     * `{`. Check query-basic.tql (line 4)
     */
    query = query.replace(/:.*(?<!{|})/gm, " ");
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
    await fs.writeFile(`${settings.graphqlDir}/${fileName}.graphql`, query);
    /**
     * write the typings for variables only if variables are present
     */
    const typings = `${resultTyping}\n${variableTyping}`;
    await fs.writeFile(`${settings.typingsDir}/${fileName}.ts`, typings);
  } catch (error) {
    console.log(error);
  }
}

// async function removeMatchFromQuery(
//   query: string,
//   removeTill: number
// ): string {}

/**
 * generate typings for the variables
 * @returns an interface in string write to a tsfile and enjoy
 */
async function generateVariableTyping(slicedQuery: string) {
  const varaiblesStringArray: string[] = [];
  let start = 0,
    end = 0;
  /**
   * capture all the variables inside the first `(...)` block
   */
  for (let index = 0; index < slicedQuery.length; index++) {
    /**
     * both the `(` and `)` were found, so the variables also found, therefore
     * exiting the loop
     */
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
       * if `$` is present ignore otherwise add
       */
      if (["$"].indexOf(slicedQuery[index]) === -1) {
        varaiblesStringArray.push(slicedQuery[index]);
      }
    }
  }
  // console.log("variables string", slicedQuery.slice(start, end + 1));
  /**
   * join the char array to make string
   * @example
   * query Something($id1: String!, $id2: Int)
   * this will turn to `id1: String!, id2: Int` after joining
   */
  const variablesString = varaiblesStringArray.join("");
  // console.log("variables string", varaiblesStringArray.join(""));
  /**
   * split to get every variable.
   * @example
   * `id1: String!, id2: Int`  to `id1: String!`, `id2: Int`
   */
  variablesString.split(",");
  // console.log(variablesString.split(","));
  const resultVariablesTypeObject: IStringObject = {};
  // return variablesString;
  for (const variableLine of variablesString.split(",")) {
    /**
     * split and trim every variable
     */
    const [variable, type] = variableLine
      .split(":")
      .map((variable) => variable.trim());
    /**
     * if last char is `!` then type is strict
     */
    if (type[type.length - 1] === "!") {
      resultVariablesTypeObject[variable] =
        definations[type.slice(0, type.length - 1)];
    } else {
      /** type is not strict so add null
       */
      resultVariablesTypeObject[variable] = definations[type] + " | null";
    }
  }
  const stringifiedVariableType =
    "export interface IVariables " +
    /**
     * remove all the `"` from the Json string
     */
    JSON.stringify(resultVariablesTypeObject, null, 4).replace(/\"/g, "");
  // console.log(
  //   resultVariablesTypeObject,
  //   JSON.stringify(resultVariablesTypeObject, null, 4)
  // );
  // console.log(stringifiedVariableType);
  return stringifiedVariableType;
}

function generateResultTyping(query: string): string {
  const resultTypingArray = [];
  const stk = [];
  for (const ch of query) {
    if (ch === "(") {
      stk.push("(");
    } else if (ch === ")") {
      stk.pop();
    } else if (stk.length === 0) {
      resultTypingArray.push(ch);
    }
  }
  console.log("result typings", resultTypingArray.join(""));
  console.log(
    "chars inside highest level brackets\n",
    charactersInsideBrackets(resultTypingArray.join(""))
  );
  return iResultGenerator(charactersInsideBrackets(resultTypingArray.join("")));
}

/**
 * get characters inside the first brackets
 * @param query
 */
function charactersInsideBrackets(query: string) {
  const result: string[] = [];
  let bracketCount = 0;
  const openingBrackets = ["{", "["];
  const closingBrackets = ["}", "]"];
  for (const ch of query) {
    if (openingBrackets.includes(ch)) {
      bracketCount++;
      result.push(ch);
    } else if (closingBrackets.includes(ch)) {
      bracketCount--;
      result.push(ch);
    } else if (bracketCount > 0) {
      result.push(ch);
    }
  }
  // console.log(result);
  return result.join("");
}

function iResultGenerator(str: string): string {
  str = str.replace(/\[/g, "");
  str = str.replace(/\]/g, "[]");
  Object.keys(definations).forEach((type) => {
    str = str.replace(new RegExp(`${type}\!`, "g"), definations[type]);
    str = str.replace(
      new RegExp(`${type}`, "g"),
      definations[type] + ` | null`
    );
  });
  str = "export interface IResult" + str;
  return str;
}

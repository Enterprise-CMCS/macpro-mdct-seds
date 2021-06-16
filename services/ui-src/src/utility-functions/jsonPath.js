import jsonpath from "jsonpath";

export const selectRowColumnValueFromArray = (array, id) => {
  const foundValue = jsonpath.query(array, id)[0];
  const returnValue = foundValue !== null ? foundValue : 0;
  return returnValue;
};
//ABOVE IS NEW FUNCTIONALITY FOR SEDS

const fullPathFromIDPath = originalPath => {
  const idMatch = /\[\?\(@\.id===?['"]([^'"]+)['"]\)\](.*)$/.exec(originalPath);

  // Don't bother building up a short-circuited path if there's not an ID.
  if (idMatch) {
    // Pull out the ID as well as everything *after* the ID. That stuff needs
    // to get pusehd on to the back of whatever path we build up here.
    const [, id, rest] = idMatch;

    // Split the ID into its parts. We don't need the year, so toss it.
    const [, section, subsection, part, question] = id.split("-");

    // Now see what bits we have and assemble the pieces.
    const pathParts = ["$."];
    if (section) {
      // Sections start at 0, so we don't have to do anything special with them.
      pathParts.push(`.formData[${+section}].contents.section`);
    }
    if (subsection) {
      // We'll make an assumption that subsections will always be a-zz, because
      // that seems safe enough for now.);
    }
    if (part) {
      // Parts start at 1, but arrays don't.
      pathParts.push(`.parts[${+part - 1}]`);
    }
    if (question) {
      // If there's a question part, then the whole ID is for a question. Yay!
      pathParts.push(`..questions[?(@.id==='${id}')]`);
    }

    // Now tack on anything at the end and push it all together.
    pathParts.push(rest);
    return pathParts.join("");
  }

  return originalPath;
};

// Map of generic paths to their exact counterparts
const exactPathMap = {};

const getExactPath = (data, path) => {
  let exact = exactPathMap[path];

  // If we don't already have a matching exact path, we'll need to fetch it.
  if (!exact) {
    const pathShortCircuit = fullPathFromIDPath(path);
    console.log("data in exact", data);
    console.log("pathShortCircuit", pathShortCircuit);
    const paths = jsonpath.paths(data, pathShortCircuit);
    console.log("paths", paths);
    if (paths.length > 0) {
      // If there are any matching paths, cache off the first one. The paths
      // we get back above are in array form, but we want to cache the string
      // form, so stringify it first.
      exact = jsonpath.stringify(paths[0]);

      // If the incoming path ends with [*], the jsonpath.paths method will
      // return an array with all of the matching paths, and the first one will
      // end with [0]. But that's not what is being requested: the [*] at the
      // end means the request is for ALL of the things, not the first, so in
      // that case, replace [0] at the end of the exact path with [*].
      if (path.endsWith("[*]")) {
        exact = exact.replace(/\[0\]$/, "[*]");
      }
    } else {
      // If there is NOT a matching path, cache the inexact path so we don't
      // bother doing the path lookup again in the future.
      exact = path;
    }

    exactPathMap[path] = exact;
  }

  return exact;
};

// These are the methods in jsonpath that actually do lookups into the data
// object, so these should use the cache. Build those methods here.
const methodsToWrap = ["apply", "nodes", "parent", "paths", "query", "value"];
const wrappers = methodsToWrap.reduce(
  (current, methodName) => ({
    ...current,
    [methodName]: (obj, path, ...rest) => {
      const exactPath = getExactPath(obj, path);
      return jsonpath[methodName](obj, exactPath, ...rest);
    }
  }),
  {}
);

// These methods don't do lookups, so we can just pass them straight through.
wrappers.parse = jsonpath.parse;
wrappers.stringify = jsonpath.stringify;

export default wrappers;

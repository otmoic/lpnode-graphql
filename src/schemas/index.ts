const fs = require("fs");
const path = require("path");
import * as _ from "lodash";
var typeDefsStr = require("../schemas_global/global").schemas_global;
let resolvers = {};
const preData = function () {
  {
    const fileList = fs.readdirSync(__dirname);
    for (const item of fileList) {
      const filePath = path.join(__dirname, item);
      const stat = fs.lstatSync(filePath);
      if (stat.isFile()) {
        const extName = path.extname(filePath);

        if (extName !== ".js") {
          continue;
        }
        const baseName = path.basename(filePath, ".js");
        if (baseName === "index") {
          continue;
        }
        const defRaw = require(filePath);
        const typeDefsItem = defRaw.typeDefs;
        const resolversItem = defRaw.resolvers;
        if (typeDefsItem !== undefined) {
          typeDefsStr =
            typeDefsStr + "\n\n#________system split" + typeDefsItem;
        }
        const resolversList = _.get(resolversItem, "Query", {});
        Object.keys(resolversList).forEach((resolversFunName) => {
          if (typeof resolversList[resolversFunName] === "function") {
            _.set(
              resolvers,
              `Query.${resolversFunName}`,
              resolversList[resolversFunName]
            );
          }
        });
      } else {
        // console.warn(filePath, "not a file");
      }
    }
  }
};
preData();

const schemas_typeDefs: any = typeDefsStr;
const schemas_resolvers = resolvers;

export { schemas_resolvers, schemas_typeDefs };

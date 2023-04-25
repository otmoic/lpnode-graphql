const cond = ["_and", "_or"];
import * as _ from "lodash";
import { logger } from "./sys_lib/logger";
const readyList = ["_eq", "_neq", "_gt", "_gte", "_lt", "_lte", "_in", "_nin"];
const replaceOp = (op: string) => {
  if (!readyList.includes(op)) {
    throw new Error(`暂时还没有实现的操作方法${op}`);
  }
  op = op.replace("_neq", "$ne");
  op = op.replace("_", "$");
  return op;
};
function customizer(objValue, srcValue) {
  if (_.isArray(objValue)) {
    return objValue.concat(srcValue);
  }
}
const getAnd = (dataSet, optKeys: any[] = []) => {
  const andList: any = [];
  for (const key of Object.keys(dataSet)) {
    const locationKeys: any[] = JSON.parse(JSON.stringify(optKeys));
    locationKeys.push(key);
    if (cond.includes(key)) {
      andList.push(...getAnd(dataSet[key], locationKeys));
    } else {
      andList.push(...getOpt(dataSet[key], [key]));
    }
  }
  return andList;
};
const getOr = (dataSet, optKeys: any[] = []) => {
  const andList: any = [];
  for (const key of Object.keys(dataSet)) {
    const locationKeys: any[] = JSON.parse(JSON.stringify(optKeys));
    locationKeys.push(key);
    if (cond.includes(key)) {
      andList.push(...getAnd(dataSet[key], locationKeys));
    } else {
      andList.push(...getOpt(dataSet[key], [key]));
    }
  }
  return andList;
};
const getOpt = (dataSet: any, optKeys: any[]) => {
  const result: any[] = [];
  for (const key of Object.keys(dataSet)) {
    const locationKeys: any[] = JSON.parse(JSON.stringify(optKeys));
    locationKeys.push(key);
    // console.log(typeof dataSet[key], JSON.stringify(dataSet[key]));
    if (!_.isPlainObject(dataSet[key])) {
      // console.log(optKeys, "val", dataSet[key]);
      const optSymbol = ((input: string) => {
        return replaceOp(input);
      })(locationKeys[locationKeys.length - 1]);
      result.push({
        key: _.slice(locationKeys, 0, locationKeys.length - 1).join("."),
        symbol: optSymbol,
        val: _.set({}, optSymbol, dataSet[key]),
      });
      continue;
    }

    if (cond.includes(key)) {
      result.push(
        ...getOpt(
          dataSet[key],
          _.slice(locationKeys, 0, locationKeys.length - 1)
        )
      );
    } else {
      result.push(...getOpt(dataSet[key], locationKeys));
    }
  }
  return result;
};
const deepGetFromObject = (raw: any) => {
  let deepGetValue: any[] = [];
  const deepGet = (dataSet: any, keySet: string[]) => {
    const keys = Object.keys(dataSet);
    for (const key of keys) {
      const locationKey = JSON.parse(JSON.stringify(keySet));
      locationKey.push(key);
      if (_.isPlainObject(dataSet[key])) {
        deepGet(dataSet[key], locationKey);
      } else {
        deepGetValue.push({
          key: locationKey.join("."),
          val: dataSet[key],
        });
      }
    }
  };
  deepGetValue = [];
  deepGet(raw, []);
  return deepGetValue;
};

class DataProcess {
  public async query(mongo_model: any, contextValue: any): Promise<any> {
    const findOption = this._getFindOption(contextValue);
    const sortOption = this._getSortOption(contextValue);
    const limitOption = this._getLimitOption(contextValue);
    const skipOption = this._getSkipOption(contextValue);
    let optionMongo = mongo_model.find(findOption).sort(sortOption);
    logger.debug(
      `mongo_model.find(${JSON.stringify(findOption)}).sort(${JSON.stringify(
        sortOption
      )});`
    );
    if (limitOption !== undefined) {
      optionMongo.limit(limitOption);
      logger.debug(`optionMongo.limit(${limitOption});`);
    }
    if (skipOption !== undefined) {
      optionMongo.skip(skipOption);
      logger.debug(`optionMongo.skip(${skipOption});`);
    }
    return await optionMongo;
  }
  public async aggregate(
    mongo_model: any,
    contextValue: any,
    fieldInfo: any
  ): Promise<any> {
    logger.info("input option ===========================");
    logger.debug(contextValue);
    logger.info("===========================");
    const findOption = this._getFindOption(contextValue);
    const aggOption: any[] = [];
    aggOption.push({ $match: findOption });
    const disOn = (() => {
      let disOnField = _.get(contextValue, "distinct_on", "$_id");
      if (disOnField !== "$_id" && typeof disOnField === "object") {
        const disInfo = deepGetFromObject(disOnField);
        if (disInfo.length >= 1) {
          const disKey = [disInfo[0].key, disInfo[0].val].join(".");
          disOnField = disKey;
        } else {
          disOnField = "$_id";
        }
      }
      if (disOnField !== "$_id") {
        disOnField = `$${disOnField}`;
      }
      disOnField = disOnField.replaceAll("$_top.", "$");
      return disOnField;
    })();

    const groupBase = { $group: { _id: disOn } };
    this._getGroupOption(fieldInfo, groupBase);
    aggOption.push(groupBase);
    console.log("===================================");
    console.dir(aggOption, { depth: 10 });
    console.log("===================================");
    const sortOption = this._getSortOption(contextValue);
    const limitOption = this._getLimitOption(contextValue);
    const skipOption = this._getSkipOption(contextValue);
    const optionMongo = mongo_model.aggregate(aggOption);

    if (limitOption !== undefined) {
      optionMongo.limit(limitOption);
      logger.debug(`optionMongo.limit(${limitOption});`);
    }
    if (skipOption !== undefined) {
      optionMongo.skip(skipOption);
      logger.debug(`optionMongo.skip(${skipOption});`);
    }
    const project = this.getProject(groupBase);
    if (Object.keys(project).length > 0) {
      logger.info("project", project, "🌸");
      optionMongo.project(project);
    }
    if (Object.keys(sortOption).length > 0) {
      logger.debug(`order by`, sortOption, "🌸");
      optionMongo.sort(sortOption);
    }

    let result = await optionMongo;
    result = this._formatResult(result);
    console.log("result ==============================");
    console.dir(result, { depth: 10 });
    console.log(" ==============================");
    return result;
    // return [{}];
  }
  public getProject(groupBase: any) {
    const groupSet = _.get(groupBase, "$group", {});
    const project = {};
    Object.keys(groupSet).forEach((key) => {
      if (key === "_id") {
        const idRewrteKey = (() => {
          let projectKey = groupSet[key].replaceAll("$", "");
          return projectKey;
        })();
        project[idRewrteKey] = "$_id";
      }
      project[key] = 1;
    });

    return project;
  }
  public _formatResult(result: any[]) {
    let ret: any[] = [];
    result.forEach((row) => {
      // 处理max 结果集
      const replaceField = (type: string) => {
        Object.keys(row).forEach((key) => {
          let keyCopy: any = key;
          if (keyCopy.includes(`_____${type}`)) {
            keyCopy = keyCopy.replaceAll(`_____${type}`, "");
            keyCopy = keyCopy.replaceAll(`_____`, ".");
            const setVal = row[key];
            _.set(row, `${type}.${keyCopy}`, setVal);
          }
        });
      };
      replaceField("max");
      replaceField("min");
      replaceField("sum");
      replaceField("avg");
      ret.push(row);
    });
    return ret;
  }
  public _getGroupOption(fieldInfo: any, groupBase: any) {
    let fieldNameList: string[] = [];
    const getFieldInfo = (field) => {
      if (_.get(field, "type._fields", undefined)) {
        const nextKey = Object.keys(_.get(field, "type._fields", {}))[0];
        const nextScan = _.get(field, `type._fields.${nextKey}`, {});
        fieldNameList.push(nextKey);
        getFieldInfo(_.get(nextScan));
      }
    };
    const getAggregateOptList = (MinOrMaxFieldList: any[], type = "max") => {
      const retList: any[] = [];
      const list = Object.keys(MinOrMaxFieldList);
      for (const key of list) {
        fieldNameList = [key];
        getFieldInfo(MinOrMaxFieldList[key]);
        retList.push({
          key: (() => {
            const arr = JSON.parse(JSON.stringify(fieldNameList));
            arr.push(type);
            return arr.join("_____");
          })(),
          val: (() => {
            const arr = JSON.parse(JSON.stringify(fieldNameList));
            return _.set({}, `$${type}`, `$${arr.join(".")}`);
          })(),
        });
      }
      return retList;
    };
    const maxList = getAggregateOptList(
      _.get(fieldInfo.returnType.ofType._fields, "max.type._fields"),
      "max"
    );
    maxList.forEach((item) => {
      const target = _.set({}, item.key, item.val);
      Object.assign(groupBase.$group, target);
    });
    const minList = getAggregateOptList(
      _.get(fieldInfo.returnType.ofType._fields, "min.type._fields"),
      "min"
    );
    minList.forEach((item) => {
      const target = _.set({}, item.key, item.val);
      Object.assign(groupBase.$group, target);
    });
    const sumList = getAggregateOptList(
      _.get(fieldInfo.returnType.ofType._fields, "sum.type._fields"),
      "sum"
    );
    sumList.forEach((item) => {
      const target = _.set({}, item.key, item.val);
      Object.assign(groupBase.$group, target);
    });
    const avgList = getAggregateOptList(
      _.get(fieldInfo.returnType.ofType._fields, "avg.type._fields"),
      "avg"
    );
    avgList.forEach((item) => {
      const target = _.set({}, item.key, item.val);
      Object.assign(groupBase.$group, target);
    });
    // console.log(fieldInfo.returnType.ofType._fields);
    // for (const item of fieldInfo.returnType.ofType._fields) {
    //   console.log(item);
    // }
  }
  public _getFindOption(contextValue: any) {
    let findOption = {};
    if (!contextValue.where) {
      return findOption;
    }
    const _getField = () => {
      const dataSet = contextValue.where;
      Object.keys(dataSet).forEach((key) => {
        if (cond.includes(key)) {
          if (key === "_and") {
            const andList: any[] = [];
            getAnd(dataSet[key], [key]).forEach((item) => {
              // console.log("====",item)
              const optionItem = {};
              optionItem[item.key] = item.val;
              andList.push(optionItem);
            });
            _.set(findOption, "$and", andList);
          }
          if (key === "_or") {
            const andList: any[] = [];
            getOr(dataSet[key], [key]).forEach((item) => {
              // console.log("====",item)
              const optionItem = {};
              optionItem[item.key] = item.val;
              andList.push(optionItem);
            });
            _.set(findOption, "$or", andList);
          }
        } else {
          getOpt(dataSet[key], [key]).forEach((item) => {
            const dataSet = {};
            dataSet[item.key] = item.val;
            findOption = _.mergeWith(findOption, dataSet, customizer);
          });
        }
      });
    };
    _getField();
    return findOption;
  }
  public _getSortOption(contextValue: any) {
    const orderBy = {};
    const orderByData = _.get(contextValue, "order_by", {});

    const orderSet = deepGetFromObject(orderByData);
    orderSet.forEach((item) => {
      let orderSide = -1;
      if (item.val === "asc") {
        orderSide = 1;
      }
      if (item.val === "desc") {
        orderSide = -1;
      }
      orderBy[item.key] = orderSide;
    });

    return orderBy;
  }
  public _getLimitOption(contextValue: any) {
    const limit = _.get(contextValue, "limit", undefined);
    if (limit) {
      return limit;
    }
    return undefined;
  }
  public _getSkipOption(contextValue: any) {
    const skip = _.get(contextValue, "offset", undefined);
    if (skip) {
      return skip;
    }
    return undefined;
  }
}

const dataProcess: DataProcess = new DataProcess();
export { dataProcess };

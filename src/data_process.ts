const notFieldList = ["_and", "_or", "_not", "_in", "_nin"];
import * as _ from "lodash";
import { logger } from "./sys_lib/logger";
const readyList = ["_eq"];
const replaceOp = (op: string) => {
  if (!readyList.includes(op)) {
    throw new Error("暂时还没有实现的操作方法");
  }

  op = op.replace("_eq", "$eq");
  return op;
};
const getOp = (key: string, dataSet: any) => {
  const ret = {};
  let mongoKey = key.replace(/___/g, ".");
  Object.keys(dataSet).forEach((op) => {
    const opStr = replaceOp(op);
    console.log(`setkey`, `${mongoKey}.${opStr}`);
    const valOpt = _.set({}, opStr, _.get(dataSet, op));
    ret[`${mongoKey}`] = valOpt;
  });
  return ret;
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
  public _getFindOption(contextValue: any) {
    const findOption = {};
    if (!contextValue.where) {
      return findOption;
    }
    const _getField = () => {
      Object.keys(contextValue.where).forEach((key) => {
        if (notFieldList.includes(key)) {
          return;
        }
        Object.assign(findOption, getOp(key, contextValue.where[key]));
      });
    };
    _getField();
    return findOption;
  }
  public _getSortOption(contextValue: any) {
    const orderBy = {};
    Object.keys(_.get(contextValue, "order_by", {})).forEach((key) => {
      let val = _.get(contextValue, `order_by.${key}`);
      let sortOpt = -1;
      if (val === "asc") {
        sortOpt = 1;
      }
      _.set(orderBy, key, sortOpt);
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

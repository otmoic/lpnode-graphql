import * as _ from "lodash";
class AppEnv {
  public initConfig() {
    const mongoHost = _.get(process.env, "MONGODB_HOST", "");
    const mongoUser = _.get(process.env, "MONGODB_ACCOUNT", "root");
    const mongoPass = _.get(process.env, "MONGODB_PASSWORD", "");
    const lpStore = _.get(process.env, "MONGODB_DBNAME_LP_STORE", "lp_store");
    const lpBusiness = _.get(
      process.env,
      "MONGODB_DBNAME_HISTORY",
      "businessHistory"
    );
    _.set(process, "_sys_config.mdb.main", {
      url: `mongodb://${mongoUser}:${mongoPass}@${mongoHost}:27017/${lpStore}?authSource=${lpStore}`,
    });
    _.set(process, "_sys_config.mdb.business", {
      url: `mongodb://${mongoUser}:${mongoPass}@${mongoHost}:27017/${lpBusiness}?authSource=${lpBusiness}`,
    });
  }
}
const appEnv: AppEnv = new AppEnv();
export { appEnv };

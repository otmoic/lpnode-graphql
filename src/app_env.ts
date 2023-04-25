import * as _ from "lodash";
class AppEnv {
  public isProd(): boolean {
    const isProd = _.get(
      process.env,
      "OBRIDGE_LPNODE_DB_REDIS_MASTER_SERVICE_HOST",
      null
    );
    if (isProd != null) {
      return true;
    }
    return false;
  }
  public initConfig() {
    const mongoHost = _.get(process.env, "LP_NODE_DATA_MONGO_URL", "");
    const mongoUser = _.get(
      process.env,
      "OBRIDGE_LPNODE_DB_MONGO_MASTER_SERVICE_USER",
      "root"
    );
    const mongoPass = _.get(process.env, "MONGODBPASS", "");
    // 之后是正式环境的配置 mongo
    _.set(process, "_sys_config.mdb.main", {
      url: `mongodb://${mongoUser}:${mongoPass}@${mongoHost}:27017/lp_store?authSource=admin`,
    });
    _.set(process, "_sys_config.mdb.business", {
      url: `mongodb://${mongoUser}:${mongoPass}@${mongoHost}:27017/businessHistory?authSource=admin`,
    });
  }
}
const appEnv: AppEnv = new AppEnv();
export { appEnv };

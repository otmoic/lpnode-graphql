import { Schema } from "mongoose";
import { Mdb } from "../module/database/mdb";
import * as _ from "lodash";

const dbKey = "business"; // model 链接的数据库
const mongoConn = Mdb.getInstance().getMongoDb(dbKey);
const ammBusinessSchema = new Schema({
  _id: String,
  priceInfo: {
    coinPrice: String,
  },
});
export const ammBusinessModule = mongoConn.model(
  "ammBusinessModule",
  ammBusinessSchema,
  `amm_business`
);

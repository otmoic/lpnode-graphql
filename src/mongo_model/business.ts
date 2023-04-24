import { Schema } from "mongoose";
const mongoose = require("mongoose");
import { Mdb } from "../module/database/mdb";
import * as _ from "lodash";

const dbKey = "business"; // model 链接的数据库
const mongoConn = Mdb.getInstance().getMongoDb(dbKey);
const businessSchema = new Schema({
  _id: mongoose.ObjectId,
  business: {
    business_hash: String,
  },
});
export const businessModule = mongoConn.model(
  "businessModule",
  businessSchema,
  `business`
);

import { Schema } from "mongoose";
const mongoose = require("mongoose");
import { Mdb } from "../module/database/mdb";
import * as _ from "lodash";

const dbKey = "business"; // model 链接的数据库
const mongoConn = Mdb.getInstance().getMongoDb(dbKey);
const businessSchema = new Schema({
  _id: mongoose.ObjectId,
  business: Object,
  pre_business: Object,
  event_transfer_out: Object,
  event_transfer_in: Object,
  event_transfer_out_confirm: Object,
  event_transfer_in_confirm: Object,
  event_transfer_out_refund: Object,
  event_transfer_in_refund: Object,
});
export const businessModule = mongoConn.model(
  "businessModule",
  businessSchema,
  `business`
);

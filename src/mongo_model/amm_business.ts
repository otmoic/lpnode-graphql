import { Schema } from "mongoose";
import { Mdb } from "../module/database/mdb";
import * as _ from "lodash";

const dbKey = "business";
const mongoConn = Mdb.getInstance().getMongoDb(dbKey);
const ammBusinessSchema = new Schema({
  _id: String,
  raw_id: String,
  priceInfo: {
    coinPrice: String,
    coinOrigPrice: String,
    nativeCoinPrice: String,
    nativeCoinOrigPrice: String,
    hedgeFeePrice: Number,
    hedgeFeeCoin: String,
  },
  userInput: {
    amount: Number,
    assets: String,
    tokenName: String,
  },
  srcChainInfo: {
    received: [{ amount: Number, assets: String }],
    systemDeduct: [{ amount: Number, assets: String, fee: String }],
  },
  dstChainInfo: {
    send: [{ amount: Number, assets: String }],
    systemDeduct: [{ amount: Number, assets: String, fee: String }],
  },
  cexInfo: {
    assetsList: [
      {
        side: String,
        stdSymbol: String,
        clientOrderId: String,
        cexOrderId: String,
        orderIdInfo: {
          marketType: String,
          orderIndex: Number,
          price: Number,
        },
        assets: String,
        average: String,
        amount: String,
        action: String,
        lostAmount: String,
        isFee: Boolean,
      },
    ],
    hedgePlan: [
      {
        orderId: String,
        symbol: String,
        side: String,
        amount: String,
        amountNumber: Number,
      },
    ],
    orders: [
      {
        amount: Number,
        averagePrice: String,
        slippage: String,
        fee: {
          ETH: String,
        },
        symbol: String,
        clientOrderId: String,
        status: Number,
        errMsg: String,
      },
    ],
  },
  profit: {
    recode: [{}],
  },
});
export const ammBusinessModule = mongoConn.model(
  "ammBusinessModule",
  ammBusinessSchema,
  `amm_business`
);

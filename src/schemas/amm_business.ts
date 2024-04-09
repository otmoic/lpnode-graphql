import {ammBusinessModule} from "../mongo_model/amm_business";

const typeDefs = `#graphql
# Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
type AmmBusiness_Profit {
  recode: [String]
}

type AmmBusiness_CexInfo_Orders {
  amount: String
  slippage: String
  symbol: String
}

type AmmBusiness_CexInfo_HedgePlan {
  orderId: String
  symbol: String
  side: String
  amount: String
  amountNumber: Float
}

type AmmBusiness_CexInfo_AssetsList {
  side: String
  stdSymbol: String
  clientOrderId: String
  cexOrderId: Int
  assets: String
  average: Float
  amount: Float
  action: String
  lostAmount: String
}

type AmmBusiness_CexInfo {
  orders: [AmmBusiness_CexInfo_Orders]
  hedgePlan: [AmmBusiness_CexInfo_HedgePlan]
  assetsList: [AmmBusiness_CexInfo_AssetsList]
}

type AmmBusiness_SystemDeduct {
  amount: Float
  assets: String
  fee: String
}

type AmmBusiness_DstChainInfo_Send {
  amount: Float
  assets: String
}

type AmmBusiness_DstChainInfo {
  systemDeduct: [AmmBusiness_SystemDeduct]
  send: [AmmBusiness_DstChainInfo_Send]
}

type AmmBusiness_SrcChainInfo_Received {
  amount: Float
  assets: String
}

type AmmBusiness_SrcChainInfo {
  systemDeduct: [AmmBusiness_SystemDeduct]
  received: [AmmBusiness_SrcChainInfo_Received]
}

type AmmBusiness_UserInput {
  amount: Float
  assets: String
  tokenName: String
}

type AmmBusiness_PriceInfo {
  coinPrice: String
  coinOrigPrice: String
  nativeCoinPrice: String
  nativeCoinOrigPrice: String
}

type AmmBusiness {
  _id: String
  raw_id: String
  profit: AmmBusiness_Profit
  cexInfo: AmmBusiness_CexInfo
  dstChainInfo: AmmBusiness_DstChainInfo
  srcChainInfo: AmmBusiness_SrcChainInfo
  userInput: AmmBusiness_UserInput
  priceInfo: AmmBusiness_PriceInfo
}

# Types with identical fields:
# Send Received


type Query {
  ammBusinessList(_id: String): [AmmBusiness]
}
`;
const resolvers = {
    Query: {
        ammBusinessList: async (_, contextValue) => {
            console.log("find ammBusinessModule data....");
            return await ammBusinessModule.find({});
        },
    },
    Test: {},
};
export {typeDefs, resolvers};


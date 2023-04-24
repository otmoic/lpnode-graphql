import { businessModule } from "../mongo_model/business";
import * as _ from "lodash";
import { logger } from "../sys_lib/logger";
import { dataProcess } from "../data_process";

const typeDefs = `#graphql

# Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
type Business_business {
  business_hash: String
}
type Business {
  _id: String
  business: Business_business
}


# 过滤相关
input Business_where {
  _id: StringFilter
  business___business_hash: StringFilter
  _and: Business_where
  _or: Business_where
}
input Business_order_by{
  _id:orderType
  business___business_hash:orderType
}
type Query {
  businessList(_id: String,offset:Int,limit:Int,where:Business_where,order_by:Business_order_by): [Business]
}
`;
const resolvers = {
  Query: {
    businessList: async (__, contextValue) => {
      logger.info(contextValue);

      try {
        return await dataProcess.query(businessModule, contextValue);
      } catch (e) {
        logger.error(e);
        throw e;
      }
    },
  },
};
export { typeDefs, resolvers };

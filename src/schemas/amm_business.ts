import { ammBusinessModule } from "../mongo_model/amm_business";

const typeDefs = `#graphql
# Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
type Business_priceInfo {
  coinPrice: String
}
type AmmBusiness {
  _id: String
  priceInfo: Business_priceInfo
}

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
};
export { typeDefs, resolvers };

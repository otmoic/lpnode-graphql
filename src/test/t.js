const VerEx = require('verbal-expressions');
const XRegExp = require('xregexp');
const src = `#graphql
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
`
// const integer = VerEx().digit().oneOrMore();
// console.log(integer)
const result = VerEx().find('type').then(" ").anything().then("{").anything().oneOrMore().toRegExp();
console.log(result)

XRegExp.forEach(src, result, (match, i) => {
    console.log(match)
});

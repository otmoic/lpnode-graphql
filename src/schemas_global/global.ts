const schemas_global = `
  input StringFilter {
    _eq:String
    _gt:String
    _in:[String]
    _nin:[String]
    _neq:String
  }
  input IntFilter{
    _eq:Int
    _in:[Int]
    _gt:Int
    _gte: Int
    _lt :Int
    _lte:Int
    _nin:[Int]
    _neq:Int
  }
  enum orderType {
    asc
    desc
  }
`;

export { schemas_global };

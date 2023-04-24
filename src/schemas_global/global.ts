const schemas_global = `
  input StringFilter {
    _eq:String
    _gt:String
    _neq:String
  }
  input IntFilter{
    _eq:Int
    _gt:Int
    _neq:Int
  }
  enum orderType {
    asc
    desc
  }
`;

export { schemas_global };

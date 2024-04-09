## Introduction
A GraphQL query server built on Apollo Server, through which you can use the GraphQL query language to query cross-chain records from your Lp database. By directly accessing or aggregating these records, you can implement external functions such as data monitoring, alerts, or data analysis.

## Main Functions
* Implemented a universal GraphQL query function for MongoDB;
* Extendable by defining simple types for queryable fields;
* Supports aggregation for MongoDB.

## Edit schema
* modify schema definition; refer to the files in the src/schemas directory
## Query example
```js
query ExampleQuery {

  ammBusinessList {
    _id
    raw_id
    profit {
      recode
    }
    cexInfo {
      orders {
        amount
        slippage
        symbol
      }
      hedgePlan {
        orderId
        symbol
        side
        amount
        amountNumber
      }
      assetsList {
        side
        stdSymbol
        clientOrderId
        cexOrderId
        assets
        average
        amount
        action
        lostAmount
      }
    }
    dstChainInfo {
      systemDeduct {
        amount
        assets
        fee
      }
      send {
        amount
        assets
      }
    }
    srcChainInfo {
      received {
        amount
        assets
      }
    }
    userInput {
      amount
      assets
      tokenName
    }
    priceInfo {
      coinPrice
      coinOrigPrice
      nativeCoinPrice
      nativeCoinOrigPrice
    }
  }
}

```
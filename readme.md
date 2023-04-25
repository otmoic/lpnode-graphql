## Example
```javascript
query Business {
    businessAggregate (
        order_by:{business:{business_hash:asc},_id:desc},
    where: {
        business:{step:{_in:[1,2,3,4]}}
        _and:{business:{step:{_gte:1}}},
    },
    distinct_on: {business:business_hash}){
        max{
            business {
                step
            }
        }
        min{
            business {
                step
            }
        }
        sum {
            business {
                step
            }
        }
        avg {
            business {
                step
            }
        }
    }
}

```

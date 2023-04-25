import * as _ from "lodash";
const raw = {
  bus: {
    id: "asc",
    age: 10,
  },
  Bicycle: {
    name: "fh",
  },
};
let deepGetValue: any[] = [];
const deepGet = (dataSet: any, keySet: string[]) => {
  const keys = Object.keys(dataSet);
  for (const key of keys) {
    const locationKey = JSON.parse(JSON.stringify(keySet));
    locationKey.push(key);
    if (_.isPlainObject(dataSet[key])) {
      deepGet(dataSet[key], locationKey);
    } else {
      deepGetValue.push({
        key: locationKey.join("."),
        val: dataSet[key],
      });
    }
  }
};
deepGetValue = [];
deepGet(raw, []);
console.log(deepGetValue);

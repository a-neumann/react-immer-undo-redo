import annotateWithPaths, { getPath } from "./annotateWithPaths";

test("can annotate nested objects with paths", () => {

    const o = {
        str: "string",
        num: 1,
        nested: {
            prop: "nested",
            deep: {
                prop: "deep nested"
            }
        }
    };

    annotateWithPaths(o);

    expect(getPath(o)).toEqual([]);
    expect(getPath(o.str)).toEqual(null);
    expect(getPath(o.num)).toEqual(null);
    expect(getPath(o.nested)).toEqual(["nested"]);
    expect(getPath(o.nested.deep)).toEqual(["nested", "deep"]);
});

test("can annotate array items with paths", () => {

    const o = {
        arr: [
            {},
            {
                prop: "item",
                nested: {
                    prop: "nested"
                }
            }
        ],
        nested: {
            arr: [
                [
                    { prop: "array" }
                ]
            ]
        }
    };

    annotateWithPaths(o);

    expect(getPath(o)).toEqual([]);
    expect(getPath(o.arr[1])).toEqual(["arr", "1"]);
    expect(getPath(o.arr[1].nested)).toEqual(["arr", "1", "nested"]);
    expect(getPath(o.nested.arr[0][0])).toEqual(["nested", "arr", "0", "0"]);
});
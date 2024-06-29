import annotateWithPaths, { getByPath, getPath } from "./annotateWithPaths";

test("can annotate and find nested objects", () => {

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
    expect(getByPath(o, [])).toEqual(o);

    expect(getPath(o.str)).toEqual(null);
    expect(getPath(o.num)).toEqual(null);

    expect(getPath(o.nested)).toEqual(["nested"]);
    expect(getByPath(o, ["nested"])).toEqual(o.nested);

    expect(getPath(o.nested.deep)).toEqual(["nested", "deep"]);
    expect(getByPath(o, ["nested", "deep"])).toEqual(o.nested.deep);
});

test("can annotate and find array items", () => {

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
                    { prop: "array" },
                    { prop: "array2" }
                ]
            ]
        }
    };

    annotateWithPaths(o);

    expect(getPath(o)).toEqual([]);

    expect(getPath(o.arr[1])).toEqual(["arr", "1"]);
    expect(getByPath(o, ["arr", "1"])).toEqual(o.arr[1]);

    expect(getPath(o.arr[1].nested)).toEqual(["arr", "1", "nested"]);
    expect(getByPath(o, ["arr", "1", "nested"])).toEqual(o.arr[1].nested);

    expect(getPath(o.nested.arr[0][1])).toEqual(["nested", "arr", "0", "1"]);
    expect(getByPath(o, ["nested", "arr", "0", "1"])).toEqual(o.nested.arr[0][1]);
});

test("can annotate and find items in map", () => {

    const o = {
        m: new Map([
            ["k1", { prop: "k1-prop" }],
            ["k2", { prop: "k2-prop" }],
            ["k3", { prop: "k3-prop" }]
        ])
    };

    annotateWithPaths(o);

    expect(getPath(o.m)).toEqual(["m"]);
    expect(getByPath(o, ["m"])).toEqual(o.m);

    expect(getPath(o.m.get("k2"))).toEqual(["m", "k2"]);
    expect(getByPath(o, ["m", "k2"])).toEqual(o.m.get("k2"));
});

test("can annotate and find items in set", () => {

    const item1 = { prop: "item1" };
    const item2 = { prop: "item2" };
    const item3 = { prop: "item3" };

    const o = {
        s: new Set([item1, item2, item3])
    };

    annotateWithPaths(o);

    expect(getPath(o.s)).toEqual(["s"]);
    expect(getByPath(o, ["s"])).toEqual(o.s);

    expect(getPath(Array.from(o.s)[1])).toEqual(["s", "1"]);
    expect(getByPath(o, ["s", "1"])).toEqual(item2);
});
import { immerable } from "immer";
import { getByPath, getPath } from "./annotateWithPaths";
import { IMutateContext } from "./createStore";

export function isClassInstance(o: unknown): o is Object {

    return (
        typeof o === "object" &&
        !Array.isArray(o) &&
        Object.getPrototypeOf(o) !== Object.prototype &&
        Object.getPrototypeOf(o) !== Map.prototype &&
        Object.getPrototypeOf(o) !== Set.prototype
    );
}

const CLASS_PROXY = Symbol("class_proxy");

export function createClassProxy<T extends object>(
    o: T,
    getContext: () => (IMutateContext<any> | null),
): T {

    if ((o as any)[CLASS_PROXY] === true) {
        return o;
    }

    const path = getPath(o);
    if (!path) {
        console.warn("Cannot wrap class instance without path annotation.", o);
        return o;
    }

    return new Proxy(o, {
        get(target, prop, receiver) {

            if (prop === CLASS_PROXY) return true;
            if (prop === immerable) return true;

            const value = Reflect.get(target, prop, receiver);

            if (typeof value === "function") {

                return function (...args: any[]) {

                    const context = getContext();
                    let result: unknown;

                    if (!context) console.warn("Trying to call method on proxy class but mutate context is unavailable.");

                    context?.mutate(draft => {
                        const targetInDraft = getByPath(draft, path);
                        result = value.apply(targetInDraft, args);
                    });

                    return result;
                };
            }

            return value;
        }
    });
}

export default function wrapClassInstances<T>(o: T, getContext: () => (IMutateContext<any> | null)) {

    if (!o || typeof o !== "object") return o;

    if (o instanceof Map) {

        for (const [k, v] of o) {

            if (isClassInstance(v)) {
                o.set(k, createClassProxy(v, getContext));
            }

            wrapClassInstances(v, getContext);
        }

    } else if (o instanceof Set) {

        const setValues = Array.from(o);

        if (setValues.some(isClassInstance)) {
            console.warn("Cannot wrap class instances as direct members of a Set with mutation proxies.", o);
        }

        for (const v of setValues) {

            wrapClassInstances(v, getContext);
        }

    } else {

        for (const k in o) {

            if (isClassInstance(o[k])) {
                o[k] = createClassProxy(o[k] as any, getContext);
            }

            wrapClassInstances(o[k], getContext);
        }
    }
}
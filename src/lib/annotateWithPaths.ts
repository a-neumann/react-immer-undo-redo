export const PATH = Symbol("path");

export default function annotateWithPaths(o: any, path: string[] = []) {

    if (!o || typeof o !== "object") {
        return;
    }

    if (!o[PATH]) {
        try {
            Object.defineProperty(o, PATH, {
                value: path,
                writable: false
            });
        } catch (e) {
            console.error(e, o, path);
        }
    }

    if (o instanceof Map) {

        for (const [k, v] of o) {
            annotateWithPaths(v, [...path, k]);
        }

    } else if (o instanceof Set) {

        annotateWithPaths(Array.from(o), path);

    } else {

        for (const k in o) {
            annotateWithPaths(o[k], [...path, k]);
        }
    }
}

export function getPath(o: any): string[] {

    return o[PATH] || null;
}

export function getByPath(o: any, path: string[]) {

    return path.reduce((acc, key) => {

        if (!acc) {
            return acc;
        }

        if (Array.isArray(acc)) {
            return acc[+key];
        }

        if (acc instanceof Map) {
            return acc.get(key);
        }

        if (acc instanceof Set) {
            return Array.from(acc)[+key];
        }

        return acc[key];

    }, o);
}
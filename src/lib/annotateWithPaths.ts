export const PATH = Symbol("path");

export default function annotateWithPaths(o: any, path: string[] = []) {

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

    for (const k in o) {
    
        if (typeof o[k] === "object" && o[k] !== null) {
            annotateWithPaths(o[k], [...path, k]);
        }
    }
}

export function getPath(o: any): string[] {

    return o[PATH] || null;
}

export function getByPath(o: any, path: string[]) {

    return path.reduce((acc, key) => {

        if (acc instanceof Map) {
            return acc.get(key);
        }

        return acc[key];

    }, o);
}
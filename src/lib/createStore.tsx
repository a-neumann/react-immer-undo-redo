import { Patch, applyPatches, createDraft, finishDraft, produce } from "immer";
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import annotateWithPaths, { getByPath, getPath } from "./annotateWithPaths";
import wrapClassInstances from "./wrapClassInstances";

export interface IMutateContext<S> {
    mutate: (fn: (draft: S) => void) => void,
    mutateAsync: (fn: (draft: S, abort: AbortHandle) => Promise<void>) => Promise<boolean>,
    undo: () => void,
    redo: () => void,
    on: (event: ContextEvent, fn: () => unknown) => void;
    off: (event: ContextEvent, fn: () => unknown) => void;
}

class AbortHandle {

    context: IMutateContext<any>;
    aborted = false;
    onAbortFn?: () => unknown;

    abort = () => {
        this.aborted = true;
        this.onAbortFn?.();
        this.context.off("history", this.abort);
    }

    constructor(context: IMutateContext<any>) {
        this.context = context;
        this.context.on("history", this.abort);
    }

    onAbort(fn: () => void) {
        this.onAbortFn = fn;
    }

    dispose() {
        this.onAbortFn = undefined;
        this.context.off("history", this.abort);
    }
}

class HistoryEvent extends Event {

    detail: {
        type: "undo" | "redo",
        offset: number
    };

    constructor(detail: typeof HistoryEvent.prototype.detail) {
        super("history");
        this.detail = detail;
    }
}

class MutateEvent extends Event {

    detail: {
        offset: number,
        async: boolean
    };

    constructor(detail: typeof MutateEvent.prototype.detail) {
        super("mutate");
        this.detail = detail;
    }
}

export type ContextEvent = "history" | "mutate";

export default function createStore<S extends object>(initial: S, options: { classes?: boolean } = {}) {

    const noop = () => { };

    const StoreContext = createContext<S>(initial);
    const MutateContext = createContext<IMutateContext<S>>({
        mutate: noop,
        mutateAsync: () => Promise.resolve(false),
        undo: noop,
        redo: noop,
        on: noop,
        off: noop
    });

    const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

        const mutateContextRef = useRef<IMutateContext<S> | null>(null);

        annotateWithPaths(initial);
        if (options.classes) wrapClassInstances(initial, () => mutateContextRef.current);
        const [value, _setValue] = useState(initial);
        const patchesRef = useRef<Patch[][]>([]);
        const inversePatchesRef = useRef<Patch[][]>([]);
        const undoOffsetRef = useRef<number>(0);
        const eventTargetRef = useRef<EventTarget>(new EventTarget());

        const setValue = (next: S) => {
            annotateWithPaths(next);
            if (options.classes) wrapClassInstances(next, () => mutateContextRef.current);
            _setValue({ ...next });
        };

        const handlePatches = useCallback((patches: Patch[], inversePatches: Patch[]) => {

            patchesRef.current.push(patches);
            inversePatchesRef.current.push(inversePatches);

            if (undoOffsetRef.current) {
                patchesRef.current.splice(0, patchesRef.current.length - undoOffsetRef.current);
                inversePatchesRef.current.splice(0, inversePatchesRef.current.length - undoOffsetRef.current);
                undoOffsetRef.current = 0;
            }
        }, []);

        const mutateContextValue = useMemo(() => ({
            mutate: (fn: (draft: S) => void) => {
                const nextState = produce(value, d => { fn(d as S); }, handlePatches);
                setValue(nextState);

                eventTargetRef.current.dispatchEvent(new MutateEvent({ offset: undoOffsetRef.current, async: false }));
            },
            mutateAsync: async (fn: (draft: S, abort: AbortHandle) => Promise<void>) => {
                const draft = createDraft(value);
                const abortHandle = new AbortHandle(mutateContextValue);
                await fn(draft as S, abortHandle).finally(() => abortHandle.dispose());

                if (!abortHandle.aborted) {
                    const nextState = finishDraft(draft, handlePatches);
                    setValue(nextState as S);

                    eventTargetRef.current.dispatchEvent(new MutateEvent({ offset: undoOffsetRef.current, async: true }));

                    return true;
                }

                return false;
            },
            undo: () => {
                if (inversePatchesRef.current.length > undoOffsetRef.current) {

                    undoOffsetRef.current++;
                    const undoValue = applyPatches(value, inversePatchesRef.current[inversePatchesRef.current.length - undoOffsetRef.current]);
                    setValue(undoValue);

                    eventTargetRef.current.dispatchEvent(new HistoryEvent({ type: "undo", offset: undoOffsetRef.current }));
                }
            },
            redo: () => {
                if (undoOffsetRef.current) {

                    const redoValue = applyPatches(value, patchesRef.current[patchesRef.current.length - undoOffsetRef.current]);
                    undoOffsetRef.current--;
                    setValue(redoValue);

                    eventTargetRef.current.dispatchEvent(new HistoryEvent({ type: "redo", offset: undoOffsetRef.current }));
                }
            },
            on: (event: ContextEvent, fn: () => unknown) => {
                eventTargetRef.current.addEventListener(event, fn);
            },
            off: (event: ContextEvent, fn: () => unknown) => {
                eventTargetRef.current.removeEventListener(event, fn);
            }
        }), [value]);

        mutateContextRef.current = mutateContextValue;

        return (
            <StoreContext.Provider value={value}>
                <MutateContext.Provider value={mutateContextValue}>
                    {children}
                </MutateContext.Provider>
            </StoreContext.Provider>
        );
    };

    function useStore() {

        return useContext(StoreContext);
    }

    function useStoreHistory() {

        const { undo, redo } = useContext(MutateContext);
        return { undo, redo };
    }

    function useMutate() {

        const context = useContext(MutateContext);

        return <T extends object>(o: T, fn: (o: T) => void) => {

            const path = getPath(o);

            if (path) {
                context.mutate(d => {

                    const itemInDraft = getByPath(d, path);
                    fn(itemInDraft);

                });

            } else {
                console.warn("Not a tracked object.");
            }
        };
    }

    function useMutateAsync() {

        const context = useContext(MutateContext);

        return <T extends object>(o: T, fn: (o: T, abort: AbortHandle) => Promise<void>) => {

            const path = getPath(o);

            if (path) {
                return context.mutateAsync(async (d, a) => {
                    const itemInDraft = getByPath(d, path);
                    return fn(itemInDraft, a);
                });

            } else {
                console.warn("Not a tracked object.");
            }

            return false;
        };
    }

    return {
        StoreProvider,
        StoreContext,
        useStore,
        useStoreHistory,
        useMutate,
        useMutateAsync
    };
}
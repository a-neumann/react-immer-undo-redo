import { Patch, applyPatches, produce } from "immer";
import React, { createContext, useContext, useMemo, useRef, useState } from "react";
import annotateWithPaths, { getByPath, getPath } from "./annotateWithPaths";

export default function createStore<S extends object>(initial: S) {

    const StoreContext = createContext<S>(initial);
    const UpdateContext = createContext<{
        update: (fn: (draft: S) => void) => void,
        undo: () => void,
        redo: () => void
    }>({
        update: () => { },
        undo: () => { },
        redo: () => { }
    });

    const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

        annotateWithPaths(initial);
        const [value, _setValue] = useState(initial);
        const patchesRef = useRef<Patch[][]>([]);
        const inversePatchesRef = useRef<Patch[][]>([]);
        const undoOffsetRef = useRef<number>(0);

        const setValue = (next: S) => {
            annotateWithPaths(next);
            _setValue(next);
        };

        const setContextValue = useMemo(() => ({
            update: (fn: (draft: S) => void) => {
                const nextState = produce(value, d => { fn(d as S); }, (patches, inversePatches) => {

                    patchesRef.current.push(patches);
                    inversePatchesRef.current.push(inversePatches);

                    if (undoOffsetRef.current) {
                        patchesRef.current.splice(0, patchesRef.current.length - undoOffsetRef.current);
                        inversePatchesRef.current.splice(0, inversePatchesRef.current.length - undoOffsetRef.current);
                        undoOffsetRef.current = 0;
                    }
                });
                setValue(nextState);
            },
            undo: () => {
                if (inversePatchesRef.current.length > undoOffsetRef.current) {
                    undoOffsetRef.current++;
                    const undoValue = applyPatches(value, inversePatchesRef.current[inversePatchesRef.current.length - undoOffsetRef.current]);
                    setValue(undoValue);
                }
            },
            redo: () => {
                if (undoOffsetRef.current) {
                    const redoValue = applyPatches(value, patchesRef.current[patchesRef.current.length - undoOffsetRef.current]);
                    undoOffsetRef.current--;
                    setValue(redoValue);
                }
            }
        }), [value]);

        return (
            <StoreContext.Provider value={value}>
                <UpdateContext.Provider value={setContextValue}>
                    {children}
                </UpdateContext.Provider>
            </StoreContext.Provider>
        );
    };

    function useStore() {

        return useContext(StoreContext);
    }

    function useStoreHistory() {

        const { undo, redo } = useContext(UpdateContext);
        return { undo, redo };
    }

    function useMutate() {

        const context = useContext(UpdateContext);
    
        return <T extends object>(o: T, fn: (o: T) => void) => {
    
            const path = getPath(o);
    
            if (path) {
                context.update(d => {
    
                    const itemInDraft = getByPath(d, path);    
                    fn(itemInDraft);
    
                });
    
            } else {
                console.warn("Not a tracked object.");
            }
        };
    }

    return {
        StoreProvider,
        StoreContext,
        useStore,
        useStoreHistory,
        useMutate
    };
}
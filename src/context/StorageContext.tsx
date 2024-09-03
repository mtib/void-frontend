import { createContext, FC, PropsWithChildren, useContext, useEffect, useState } from "react";
import { VoidId } from "./RouteContext";
import useStorageState from "react-use-storage-state";

export interface StorageContextType {
    knownVoids: VoidInfo[],
    addVoid: (id: VoidId) => void,
}

const context = createContext<StorageContextType | undefined>(undefined);

export interface VoidInfo {
    id: VoidId
}

export const StorageContextProvider: FC<PropsWithChildren> = ({ children }) => {

    const [knownVoids, setKnownVoids] = useStorageState<VoidInfo[]>("known-voids-v1", [])
 
    return (
        <context.Provider value={{
            knownVoids,
            addVoid: (id) => {
                setKnownVoids(current => {
                    if (current.some(v => v.id == id)) {
                        // do nothing
                        return current
                    } else {
                        return [...current, {
                            id,
                        }]
                    }
                })
            }
        }}>
            {children}
        </context.Provider>
    );
};

export const useStorageContext = () => {
    const c = useContext(context);
    if (!c) {
        throw new Error('useStorageContext must be used within a StorageContextProvider');
    }
    return c;
};

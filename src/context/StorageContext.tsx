import { createContext, FC, PropsWithChildren, useContext } from "react";
import { VoidId } from "./RouteContext";
import useStorageState from "react-use-storage-state";

export interface StorageContextType {
    updateVoid(voidId: string | undefined, update: (info: VoidInfo) => VoidInfo): unknown;
    knownVoids: VoidInfo[],
    addVoid: (id: VoidId) => void,
}

const context = createContext<StorageContextType | undefined>(undefined);

export interface VoidInfo {
    id: VoidId,
    name: string | undefined,
}

export const StorageContextProvider: FC<PropsWithChildren> = ({ children }) => {

    const [knownVoids, setKnownVoids] = useStorageState<VoidInfo[]>("known-voids-v1", []);

    return (
        <context.Provider value={{
            knownVoids,
            addVoid: (id) => {
                setKnownVoids(current => {
                    if (current.some(v => v.id == id)) {
                        // do nothing
                        return current;
                    } else {
                        return [...current, {
                            id,
                            name: undefined,
                        }];
                    }
                });
            },
            updateVoid: (voidId, update) => {
                setKnownVoids(current => {
                    if (!voidId) {
                        return current;
                    }
                    const index = current.findIndex(v => v.id == voidId);
                    if (index == -1) {
                        return current;
                    }
                    const newVoids = [...current];
                    newVoids[index] = update(newVoids[index]);
                    return newVoids;
                });
            },
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

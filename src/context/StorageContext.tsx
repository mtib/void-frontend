import { createContext, FC, PropsWithChildren, useContext } from "react";

export interface StorageContextType {
}

const context = createContext<StorageContextType | undefined>(undefined);

export const StorageContextProvider: FC<PropsWithChildren> = ({ children }) => {

    return (
        <context.Provider value={{}}>
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

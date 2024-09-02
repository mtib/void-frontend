import { createContext, FC, PropsWithChildren, useContext } from "react";

export interface DocumentContextType {
}

const context = createContext<DocumentContextType | undefined>(undefined);

export const DocumentContextProvider: FC<PropsWithChildren> = ({ children }) => {

    return (
        <context.Provider value={{}}>
            {children}
        </context.Provider>
    );
};

export const useDocumentContext = () => {
    const c = useContext(context);
    if (!c) {
        throw new Error('useDocumentContext must be used within a DocumentContextProvider');
    }
    return c;
};

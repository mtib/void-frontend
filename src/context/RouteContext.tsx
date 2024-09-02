import { createContext, FC, PropsWithChildren, useContext, useState } from "react";

export type VoidId = string;
export type DocumentId = string;
export interface RouteContextType {
    documentId: DocumentId | undefined;
    setDocumentId: (documentId: DocumentId) => void;
    voidId: VoidId | undefined;
    setVoidId: (voidId: VoidId) => void;
}

const context = createContext<RouteContextType | undefined>(undefined);

export const RouteContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const [voidId, setVoidId] = useState<VoidId | undefined>(undefined);
    const [documentId, setDocumentId] = useState<DocumentId | undefined>(undefined);

    return (
        <context.Provider value={{
            voidId,
            setVoidId,
            documentId,
            setDocumentId
        }}>
            {children}
        </context.Provider>
    );
};

export const useRouteContext = () => {
    const c = useContext(context);
    if (!c) {
        throw new Error('useRouteContext must be used within a RouteContextProvider');
    }
    return c;
};

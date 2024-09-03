import { createContext, FC, PropsWithChildren, useContext, useMemo } from "react";
import { useRouteContext } from "./RouteContext";

export interface DocumentContextType {
    documentId: string | undefined;
    setDocumentId: (documentId: string | undefined) => void;
}

const context = createContext<DocumentContextType | undefined>(undefined);

export const DocumentContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const routeContext = useRouteContext();
    return (
        <context.Provider value={useMemo(() => ({
            documentId: routeContext.documentId,
            setDocumentId: routeContext.setDocumentId,
        }), [routeContext.documentId, routeContext.setDocumentId])}>
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

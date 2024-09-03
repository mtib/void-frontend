import { createContext, FC, PropsWithChildren, useContext, useEffect, useRef, useState } from "react";

export type VoidId = string;
export type DocumentId = string;
export interface RouteContextType {
    documentId: DocumentId | undefined;
    setDocumentId: (documentId: DocumentId | undefined) => void;
    voidId: VoidId | undefined;
    setVoidId: (voidId: VoidId | undefined) => void;
}

const context = createContext<RouteContextType | undefined>(undefined);

export const RouteContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const [voidId, setVoidId] = useState<VoidId | undefined>(undefined);
    const [documentId, setDocumentId] = useState<DocumentId | undefined>(undefined);

    const initialised = useRef(false);

    useEffect(() => {
        if (!initialised.current) {
            initialised.current = true;
            const hash = window.location.hash;
            if (hash) {
                const match = RegExp(/#(v-[a-zA-Z0-9]+)(\/(d-[a-zA-Z0-9]+))?/).exec(hash);
                if (!match) {
                    history.pushState({}, '', `/#`);
                    return
                }
                const voidId = match[1];
                const documentId = match[3];
                if (voidId) {
                    setVoidId(voidId);
                }
                if (documentId) {
                    setDocumentId(documentId);
                }
            }
            return
        }
        if (voidId && documentId) {
            history.pushState({}, '', `/#${voidId}/${documentId}`);
            return
        }
        if (voidId) {
            history.pushState({}, '', `/#${voidId}`);
            return
        }
        history.pushState({}, '', `/#`);
    }, [voidId, documentId]);

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

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

const parseHash = (hash: string) => {
    const match = RegExp(/#(v-[a-zA-Z0-9]+)(\/(d-[a-zA-Z0-9]+))?/).exec(hash);
    if (!match) {
        history.pushState({}, '', `/#`);
        return { voidId: undefined, documentId: undefined };
    }
    const voidId = match[1];
    const documentId = match[3];
    return {
        voidId,
        documentId
    }
}


export const RouteContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const [voidId, setVoidId] = useState<VoidId | undefined>(undefined);
    const [documentId, setDocumentId] = useState<DocumentId | undefined>(undefined);

    const initialised = useRef(false);

    useEffect(() => {
        if (!initialised.current) {
            initialised.current = true;
            const hash = window.location.hash;
            if (hash) {
                const { voidId, documentId } = parseHash(hash);
                if (voidId) {
                    setVoidId(voidId);
                }
                if (documentId) {
                    setDocumentId(documentId);
                }
            }
            addEventListener('popstate', () => {
                const hash = window.location.hash;
                const { voidId, documentId } = parseHash(hash);
                setDocumentId(documentId);
                setVoidId(voidId);
            });

            return
        }
        if (voidId && documentId) {
            const newHash = `#${voidId}/${documentId}`;
            if (window.location.hash !== newHash) {
                history.pushState({}, '', newHash);
            }
            return
        }
        if (voidId) {
            const newHash = `#${voidId}`;
            if (window.location.hash !== newHash) {
                history.pushState({}, '', newHash);
            }
            return
        }
        if (!['', '/', '/#'].includes(window.location.hash)) {
            history.pushState({}, '', "/#");
        }
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

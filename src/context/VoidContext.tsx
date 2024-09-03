import { createContext, FC, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import { useRouteContext, VoidId } from "./RouteContext";
import { SERVER_URL } from "../server";

export interface VoidContextType {
    voidId: string | undefined;
    setVoidId: (voidId: VoidId) => void;
    metadata: object | undefined;
}

const context = createContext<VoidContextType | undefined>(undefined);

export const VoidContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const routeContext = useRouteContext();
    const [metadata, setMetadata] = useState<object | undefined>(undefined);

    useEffect(() => {
        if (!routeContext.voidId) {
            return;
        }
        (async () => {
            const resp = await fetch(`${SERVER_URL}/void/${routeContext.voidId}/metadata`);
            const body = await resp.json();
            setMetadata(body["data"]);
        })();
    }, [routeContext.voidId]);

    return (
        <context.Provider value={useMemo(() => ({
            voidId: routeContext.voidId,
            setVoidId: routeContext.setVoidId,
            metadata,
        }), [routeContext.voidId, routeContext.setVoidId, metadata])}>
            {children}
        </context.Provider>
    );
};

export const useVoidContext = () => {
    const c = useContext(context);
    if (!c) {
        throw new Error('useVoidContext must be used within a VoidContextProvider');
    }
    return c;
};

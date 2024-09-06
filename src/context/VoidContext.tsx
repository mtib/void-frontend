import { createContext, FC, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouteContext, VoidId } from "./RouteContext";
import VoidApiClient from "../api/VoidApiClient";
import { useStorageContext, VoidInfo } from "./StorageContext";
import { outlineColor } from "../consts";
import { backgroundColor } from "../consts";
import Color from "color";
import { ThemeProvider } from "styled-components";

export interface VoidContextType {
    voidId: string | undefined;
    setVoidId: (voidId: VoidId) => void;
    metadata: { [k: string]: string | undefined; } | undefined;
    setMetadata: (metadata: { [k: string]: string | undefined; }) => void;
    localVoidData: VoidInfo | undefined;
}

const context = createContext<VoidContextType | undefined>(undefined);

export const VoidContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const routeContext = useRouteContext();
    const [metadata, setMetadata] = useState<{ [k: string]: string | undefined; } | undefined>(undefined);
    const metadataRef = useRef(metadata);

    const storage = useStorageContext();

    useEffect(() => {
        const voidId = routeContext.voidId;
        if (!voidId) {
            return;
        }
        (async () => {
            const body = await VoidApiClient.getMetadata(voidId);
            setMetadata(body["data"] ?? undefined);
        })();
    }, [routeContext.voidId]);

    useEffect(() => {
        metadataRef.current = metadata;
    }, [metadata]);

    const setRemoteMetadata = useCallback((metadata: { [k: string]: string | undefined; }) => {
        const voidId = routeContext.voidId;
        if (!voidId) {
            return;
        }
        const startMetadata = metadataRef.current;
        (async () => {
            setMetadata(metadata);
            try {
                await VoidApiClient.setMetadata(voidId, metadata);
            } catch (e) {
                setMetadata(startMetadata);
                throw e;
            }

        })();
    }, [metadata, routeContext.voidId]);

    return (
        <context.Provider value={useMemo(() => ({
            voidId: routeContext.voidId,
            setVoidId: routeContext.setVoidId,
            metadata,
            setMetadata: setRemoteMetadata,
            localVoidData: storage.knownVoids.find(v => v.id == routeContext.voidId),
        }), [routeContext.voidId, routeContext.setVoidId, metadata, storage.knownVoids])}>
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

export const useCurrentVoidLocalStorage = () => {
    const { voidId } = useVoidContext();
    const storage = useStorageContext();

    const data = useMemo(() => {
        return storage.knownVoids.find(v => v.id == voidId);
    }, [storage.knownVoids, voidId]);

    return data;
};

export const useUpdateCurrentVoidLocalStorage = () => {
    const { voidId } = useVoidContext();
    const storage = useStorageContext();

    return useCallback((update: (it: VoidInfo) => VoidInfo) => {
        storage.updateVoid(voidId, update);
    }, [voidId, storage]);
};

export const useVoidPrimaryColor = () => {
    const { localVoidData } = useVoidContext();
    const color = localVoidData?.color;
    if (color && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)) {
        return color;
    }
    return outlineColor;
};

export const useVoidBackgroundColor = () => {
    const color = useVoidPrimaryColor();
    if (color) {
        return Color(color).lightness(7).hex();
    }
    return backgroundColor;
};

export const VoidThemeProvider: FC<PropsWithChildren> = ({ children }) => {
    const primaryColor = useVoidPrimaryColor();
    const backgroundColor = useVoidBackgroundColor();
    return <ThemeProvider theme={{ bg: backgroundColor, fg: primaryColor }}>{children}</ThemeProvider>;
};

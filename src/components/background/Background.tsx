import { Application } from "pixi.js";
import { useEffect, useRef } from "react";
import './Background.css';
import * as VoidSpiralPixi from "./VoidSpiralPixi/VoidSpiralPixi";
import { useVoidContext, VoidContextType } from "../../context/VoidContext";
import { DocumentContextType, useDocumentContext } from "../../context/DocumentContext";

const canvasParentId = 'background-canvas';

function Background() {
    const canvasParent = useRef<HTMLDivElement>(null);

    const voidContext = useVoidContext();
    const documentContext = useDocumentContext();

    const voidContextCallbackRef = useRef<(arg0: VoidContextType) => void>(() => { });
    const documentContextCallbackRef = useRef<(arg0: DocumentContextType) => void>(() => { });

    useEffect(() => {
        voidContextCallbackRef.current(voidContext);
    }, [voidContext]);

    useEffect(() => {
        documentContextCallbackRef.current(documentContext);
    }, [documentContext]);

    const voidContextRef = useRef(voidContext);
    const documentContextRef = useRef(documentContext);

    useEffect(() => {
        voidContextRef.current = voidContext;
    }, [voidContext]);

    useEffect(() => {
        documentContextRef.current = documentContext;
    }, [documentContext]);

    useEffect(() => {
        (async () => {
            const app = new Application();
            await app.init({
                background: '#1a041a',
                antialias: true,
            });
            canvasParent.current!.appendChild(app.canvas);
            VoidSpiralPixi.install(
                app,
                (callback) => voidContextCallbackRef.current = callback,
                (callback) => documentContextCallbackRef.current = callback,
            );

            voidContextCallbackRef.current(voidContextRef.current);
            documentContextCallbackRef.current(documentContextRef.current);
        })();
    }, []);

    return (
        <div id={canvasParentId} ref={canvasParent}></div>
    );
}

export default Background;

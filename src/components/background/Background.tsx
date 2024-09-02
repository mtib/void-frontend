import { Application } from "pixi.js";
import { useEffect, useRef } from "react";
import './Background.css';
import * as VoidSpiralPixi from "./VoidSpiralPixi/VoidSpiralPixi";

const canvasParentId = 'background-canvas';

function Background() {
    const canvasParent = useRef<HTMLDivElement>(null);

    useEffect(() => {
        (async () => {
            const app = new Application();
            await app.init({
                background: '#1a041a',
                antialias: true,
            });
            canvasParent.current!.appendChild(app.canvas);
            VoidSpiralPixi.install(app);
        })();
    }, []);

    return (
        <div id={canvasParentId} ref={canvasParent}></div>
    );
}

export default Background;

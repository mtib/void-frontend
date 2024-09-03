import { Application, Container, Graphics, GraphicsContext, Point } from "pixi.js";
import { dot, magnitude, normalize, outsideRectSample } from "./utils";
import { VoidContextType } from "../../../context/VoidContext";
import { DocumentContextType } from "../../../context/DocumentContext";
import _ from "lodash";

export function install(
    app: Application,
    onVoidContext: (arg1: (arg0: VoidContextType) => void) => void = () => { },
    onDocumentContext: (arg1: (arg0: DocumentContextType) => void) => void = () => { },
) {
    let minEdge = 0;
    function resize() {
        app.renderer.resize(window.innerWidth, window.innerHeight);
        minEdge = Math.min(window.innerWidth, window.innerHeight);
    };
    resize();
    addEventListener('resize', resize);

    onVoidContext((voidContext) => {
        console.log("pixi notified of a void context change", voidContext);
    });

    onDocumentContext((documentContext) => {
        console.log("pixi notified of a document context change", documentContext);
    });

    const randomPhaseX = Math.random() * Math.PI;
    const randomPhaseY = Math.random() * Math.PI;
    const blackHoleSize = 200;

    const blackHole = (() => {
        const g = new Graphics();
        g.circle(0, 0, blackHoleSize);
        g.fill({
            color: '#150215',
            alpha: 1.0
        });
        g.stroke({
            color: '#dad',
            width: 1.5,
        });
        g.x = app.canvas.width / 2;
        g.y = app.canvas.height / 2;
        g.scale = 0;
        return g;
    })();

    const starContainer = new Container();

    app.stage.addChild(starContainer);
    app.stage.addChild(blackHole);

    const starCount = 1000;
    const starSize = 3;

    const swirlStrength = 3;

    const starContext = new GraphicsContext()
        .rect(-starSize / 2, -starSize / 2, starSize, starSize)
        .regularPoly(0, 0, starSize, 6)
        .fill({ color: '#dad' });

    const starSizeFactor = new WeakMap<Graphics, number>();
    for (let i = 0; i < starCount; i++) {
        const star = new Graphics(starContext);
        star.x = (Math.random() * 2 - 0.5) * app.canvas.width;
        star.y = (Math.random() * 2 - 0.5) * app.canvas.height;
        star.rotation = Math.random() * Math.PI * 2;
        starSizeFactor.set(star, Math.max(1, 0.5 + Math.random()));
        star.scale.set(0, 0);
        starContainer.addChild(star);
    }

    let elapsedDt = 0;
    let elapsedMs = 0;
    app.ticker.add(() => {
        elapsedDt += app.ticker.deltaTime;
        elapsedMs += app.ticker.elapsedMS;

        const maxTravel = Math.min(minEdge / 5, 100);
        const centerOfGravity = new Point(
            app.canvas.width / 2 + Math.sin(randomPhaseX + elapsedDt / 1000) * maxTravel,
            app.canvas.height / 2 + Math.cos(randomPhaseY + elapsedDt / 700 + 1) * maxTravel,
        );
        blackHole.x = centerOfGravity.x;
        blackHole.y = centerOfGravity.y;

        if (blackHole.scale.x < 1) {
            blackHole.scale = Math.min(Math.max(0, Math.exp(elapsedMs / 300 - 0.3) - 1), 1);
        }

        starContainer.children.forEach((star) => {
            if (!(star instanceof Graphics)) {
                return;
            }

            const diff = new Point(
                star.x - centerOfGravity.x,
                star.y - centerOfGravity.y
            );

            const sizeFactor = starSizeFactor.get(star) || 1;
            if (star.scale.x < sizeFactor) {
                const scale = Math.min(sizeFactor, sizeFactor * elapsedMs / 500.0);
                star.scale = scale;
            }

            const distance = magnitude(diff);
            if (distance < blackHoleSize * blackHole.scale.x - starSize) {
                const outSide = outsideRectSample();
                const inOutSide = Math.random() * 2 - 0.5;
                if (Math.random() < 0.5) {
                    star.x = outSide * app.canvas.width;
                    star.y = inOutSide * app.canvas.height;
                } else {
                    star.x = inOutSide * app.canvas.width;
                    star.y = outSide * app.canvas.height;
                }
                return;
            }

            const upDotProductCenter = dot(normalize(diff), new Point(0, 1));
            const leftDotProductCenter = dot(normalize(diff), new Point(-1, 0));
            star.x -= (diff.x / (distance / 10) ** 2 + upDotProductCenter * swirlStrength * ((minEdge - distance) / minEdge) ** 5) * blackHole.scale.x;
            star.y -= (diff.y / (distance / 10) ** 2 + leftDotProductCenter * swirlStrength * ((minEdge - distance) / minEdge) ** 5) * blackHole.scale.x;
            star.rotation += app.ticker.deltaTime;
        });
    });
}

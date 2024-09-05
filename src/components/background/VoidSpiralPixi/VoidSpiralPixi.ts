import { Application, Container, Graphics, GraphicsContext, Point } from "pixi.js";
import { dot, magnitude, normalize, outsideRectSample } from "./utils";
import { VoidContextType } from "../../../context/VoidContext";
import { DocumentContextType } from "../../../context/DocumentContext";
import _ from "lodash";
import { outlineColor } from "../../document/editor/Editor";
import Color from "color";

let fused = false;
export function install(
    app: Application,
    onVoidContext: (arg1: (arg0: VoidContextType) => void) => void = () => { },
    onDocumentContext: (arg1: (arg0: DocumentContextType) => void) => void = () => { },
) {
    if (fused) {
        throw new Error("already fused");
        return;
    }
    fused = true;
    console.log("installing void spiral pixi");
    let minEdge = 0;
    function resize() {
        app.renderer.resize(window.innerWidth, window.innerHeight);
        minEdge = Math.min(window.innerWidth, window.innerHeight);
    };
    resize();
    addEventListener('resize', resize);

    let inVoid = false;

    const defaultBlackHoleSize = 200;
    const inVoidBlackHoleSize = 400;
    let blackHoleTargetSize = defaultBlackHoleSize;
    let blackHoleSize = 0;

    let primaryColor = Color(outlineColor);
    const starContainer = new Container();
    const redrawStar = <T>(star: T): T => {
        // @ts-ignore
        return star.clear()
            .rect(-starSize / 2, -starSize / 2, starSize, starSize)
            .regularPoly(0, 0, starSize, 6)
            .fill({ color: primaryColor.hex() });
    };

    onVoidContext((voidContext) => {
        inVoid = voidContext.voidId !== undefined;
        blackHoleTargetSize = inVoid ? inVoidBlackHoleSize : defaultBlackHoleSize;
        const nextColorCandidate = voidContext.localVoidData?.color || outlineColor;

        if (/^#([0-9a-fA-F]{3}|[0-9a-f-A-F]{6})$/.test(nextColorCandidate)) {
            primaryColor = Color(nextColorCandidate);
            starContainer.children.forEach((star) => {
                if (!(star instanceof Graphics)) {
                    return;
                }
                redrawStar(star);
            });
        }
    });

    onDocumentContext((documentContext) => {
        console.log("pixi notified of a document context change", documentContext);
    });

    const randomPhaseX = Math.random() * Math.PI;
    const randomPhaseY = Math.random() * Math.PI;

    const blackHolePosition = new Point(app.canvas.width / 2, app.canvas.height / 2);
    const blackHole = new Graphics();
    const blackHoleUpdate = () => {
        blackHole.clear();
        blackHole.circle(0, 0, blackHoleSize);
        blackHole.fill({
            color: primaryColor.lightness(5).hex(),
            alpha: 1.0
        });
        blackHole.stroke({
            color: primaryColor.lighten(0.2).hex(),
            width: 1.5,
        });
        blackHole.x = blackHolePosition.x;
        blackHole.y = blackHolePosition.y;
    };
    blackHoleUpdate();

    app.stage.addChild(starContainer);
    app.stage.addChild(blackHole);

    const swirlStrength = 3;

    const starCount = 1000;
    const starSize = 3;


    const starContext = redrawStar(new GraphicsContext());

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
        blackHolePosition.x = centerOfGravity.x;
        blackHolePosition.y = centerOfGravity.y;
        blackHoleUpdate();

        if (blackHoleSize < blackHoleTargetSize) {
            blackHoleSize = Math.min(blackHoleTargetSize, blackHoleSize + app.ticker.elapsedMS / 10);
        } else if (blackHoleSize > blackHoleTargetSize) {
            blackHoleSize = Math.max(blackHoleTargetSize, blackHoleSize - app.ticker.elapsedMS / 10);
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
            if (distance < blackHoleSize - starSize) {
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
            star.x -= (diff.x / (distance / 10) ** 2 + upDotProductCenter * swirlStrength * ((minEdge - distance) / minEdge) ** 5);
            star.y -= (diff.y / (distance / 10) ** 2 + leftDotProductCenter * swirlStrength * ((minEdge - distance) / minEdge) ** 5);
            star.rotation += app.ticker.deltaTime;
        });
    });
}

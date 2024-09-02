import { Application, Container, Graphics, GraphicsContext, Point } from "pixi.js";
import { dot, magnitude, normalize, outsideRectSample } from "./utils";

export function install(app: Application) {
    let minEdge = 0;
    function resize() {
        app.renderer.resize(window.innerWidth, window.innerHeight);
        minEdge = Math.min(window.innerWidth, window.innerHeight);
    };
    resize();
    addEventListener('resize', resize);

    const randomPhaseX = Math.random() * Math.PI;
    const randomPhaseY = Math.random() * Math.PI;
    const blackHoleSize = 200;

    const blackHole = (() => {
        const g = new Graphics();
        g.circle(0, 0, blackHoleSize);
        g.fill({
            color: '#000',
            alpha: 1.0
        });
        g.stroke({
            color: '#fff',
            width: 1.5,
        });
        g.x = app.canvas.width / 2;
        g.y = app.canvas.height / 2;
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

    for (let i = 0; i < starCount; i++) {
        const star = new Graphics(starContext);
        star.x = (Math.random() * 2 - 0.5) * app.canvas.width;
        star.y = (Math.random() * 2 - 0.5) * app.canvas.height;
        star.rotation = Math.random() * Math.PI * 2;
        const size = Math.max(1, 0.5 + Math.random());
        star.scale.set(size, size);
        starContainer.addChild(star);
    }

    let elapsed = 0;
    app.ticker.add(() => {
        elapsed += app.ticker.deltaTime;

        const maxTravel = Math.min(minEdge / 5, 100);
        const centerOfGravity = new Point(
            app.canvas.width / 2 + Math.sin(randomPhaseX + elapsed / 1000) * maxTravel,
            app.canvas.height / 2 + Math.cos(randomPhaseY + elapsed / 700 + 1) * maxTravel,
        );
        blackHole.x = centerOfGravity.x;
        blackHole.y = centerOfGravity.y;

        starContainer.children.forEach((star) => {
            const diff = new Point(
                star.x - centerOfGravity.x,
                star.y - centerOfGravity.y
            );

            const distance = magnitude(diff);
            if (distance < blackHoleSize * 0.9) {
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
            star.x -= diff.x / distance + upDotProductCenter * swirlStrength;
            star.y -= diff.y / distance + leftDotProductCenter * swirlStrength;
            star.rotation += app.ticker.deltaTime;

        });
    });
}

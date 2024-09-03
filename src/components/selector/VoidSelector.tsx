import { FC, useCallback, useRef } from "react";
import { useStorageContext } from "../../context/StorageContext";
import VoidApiClient from "../../api/VoidApiClient";
import { useVoidContext } from "../../context/VoidContext";
import { useRouteContext } from "../../context/RouteContext";


const VoidSelector: FC = () => {
    const storage = useStorageContext();
    const voids = useVoidContext();
    const routing = useRouteContext();

    const currentlyCreatingRef = useRef(false);

    const createVoid = useCallback(() => {
        if (currentlyCreatingRef.current) {
            return;
        }
        currentlyCreatingRef.current = true;
        (async () => {
            const newVoid = await VoidApiClient.createVoid();
            storage.addVoid(newVoid.id)
            currentlyCreatingRef.current = false;
            routing.setVoidId(newVoid.id);
        })();
    }, [routing.setVoidId, storage.addVoid]);

    return <div
        style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
        }}
    >
        <button onClick={createVoid}>Create new</button>
        {
            storage.knownVoids.map((voidId) => {
                return <button
                    key={voidId.id}
                    onClick={() => voids.setVoidId(voidId.id)}
                >
                    {voidId.id}
                </button>;
            })
        }
    </div>;
}

export default VoidSelector;

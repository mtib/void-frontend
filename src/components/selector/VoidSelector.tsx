import { FC, useCallback, useRef } from "react";
import { useStorageContext } from "../../context/StorageContext";
import VoidApiClient from "../../api/VoidApiClient";
import { useVoidContext } from "../../context/VoidContext";
import { useRouteContext } from "../../context/RouteContext";
import { sortBy } from "lodash";


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
            storage.addVoid(newVoid.id);
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
            sortBy(storage.knownVoids, it => it.name || it.id)
                .map((voidInfo) => {
                    return <button
                        key={voidInfo.id}
                        onClick={() => voids.setVoidId(voidInfo.id)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        {<span>{voidInfo.name || 'Unnamed'}</span>}
                        <span
                            style={{
                                fontSize: '0.8em',
                                color: 'gray',
                            }}
                        >
                            {voidInfo.id}
                        </span>
                    </button>;
                })
        }
    </div>;
};

export default VoidSelector;

import { FC, useCallback } from "react";
import { useStorageContext } from "../../context/StorageContext";
import VoidApiClient from "../../api/VoidApiClient";
import { useVoidContext } from "../../context/VoidContext";


const VoidSelector: FC = () => {
    const storage = useStorageContext();
    const voids = useVoidContext();

    const createVoid = useCallback(() => {
        (async () => {
            const newVoid = await VoidApiClient.createVoid();
            storage.addVoid(newVoid.id)
        })();
    }, []);

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
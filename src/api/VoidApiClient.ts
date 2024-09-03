import { get } from "lodash";
import { DocumentId, VoidId } from "../context/RouteContext";
import { SERVER_URL } from "../server";

const VoidApiClient = {
    createVoid: async () => {
        const resp = await fetch(`${SERVER_URL}/void`, {
            method: 'POST',
        })
        return await resp.json() as { id: string };
    },

    getDocuments: async (voidId: string) => {
        const resp = await fetch(`${SERVER_URL}/void/${voidId}/documents`);
        return await resp.json() as { id: VoidId, documents: DocumentId[] };
    },

    setMetadata: async (voidId: string, metadata: object) => {
        await fetch(`${SERVER_URL}/void/${voidId}/metadata`, {
            method: 'PUT',
            body: JSON.stringify(metadata)
        });
    },

    getMetadata: async (voidId: string) => {
        const resp = await fetch(`${SERVER_URL}/void/${voidId}/metadata`);
        return await resp.json() as { data: object | null };
    },

    getDocument: async (voidId: string, documentId: string) => {
        const resp = await fetch(`${SERVER_URL}/document/${voidId}/${documentId}`);
        return await resp.blob()
    },
}

export default VoidApiClient;
import { DocumentId, VoidId } from "../context/RouteContext";
import { SERVER_URL } from "../server";

const VoidApiClient = {
    createVoid: async () => {
        const resp = await fetch(`${SERVER_URL}/void`, {
            method: 'POST',
        });
        return await resp.json() as { id: string; };
    },

    getDocuments: async (voidId: string) => {
        const resp = await fetch(`${SERVER_URL}/void/${voidId}/documents`);
        return await resp.json() as { id: VoidId, documents: DocumentId[]; };
    },

    setMetadata: async (voidId: string, metadata: { [k: string]: string | undefined; }) => {
        await fetch(`${SERVER_URL}/void/${voidId}/metadata`, {
            method: 'PUT',
            body: JSON.stringify(metadata)
        });
    },

    getMetadata: async (voidId: string) => {
        const resp = await fetch(`${SERVER_URL}/void/${voidId}/metadata`);
        return await resp.json() as { data: { [k: string]: string | undefined; } | null; };
    },

    getDocument: async (voidId: string, documentId: string) => {
        const resp = await fetch(`${SERVER_URL}/document/${voidId}/${documentId}`);
        return await resp.blob();
    },

    createDocument: async (voidId: string, data: Blob | undefined) => {
        const resp = await fetch(`${SERVER_URL}/document/${voidId}`, {
            method: 'POST',
            body: data
        });
        return await resp.json() as {
            documentId: DocumentId;
            voidId: VoidId;
            size: number;
            approximateTime: number;
        };
    },

    updateDocument: async (voidId: string, documentId: string, data: Blob) => {
        await fetch(`${SERVER_URL}/document/${voidId}/${documentId}`, {
            method: 'PUT',
            body: data
        });
    }
};

export default VoidApiClient;

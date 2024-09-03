import { FC, useEffect, useMemo, useState } from "react";
import { DocumentId, useRouteContext, VoidId } from "../../context/RouteContext";
import VoidApiClient from "../../api/VoidApiClient";

const DocumentSelector: FC = () => {
    const routeContext = useRouteContext();

    const [documentIds, setDocumentIds] = useState<DocumentId[]>([]);

    useEffect(() => {
        setDocumentIds([]);
        const voidId = routeContext.voidId;
        if (!voidId) {
            return;
        }
        (async () => {
            // todo cancel / discard if voidId changes
            const data = await VoidApiClient.getDocuments(voidId)
            setDocumentIds(data.documents);
        })();
    }, [routeContext.voidId]);

    const [documentData, setDocumentData] = useState<{
        voidId: VoidId,
        documentId: DocumentId,
        data: Blob,
        text: string,
        title: string,
    }[]>([]);

    useEffect(() => {
        const voidId = routeContext.voidId;
        setDocumentData([]);
        if (!voidId) {
            return;
        }
        (async () => {
            setDocumentData(await Promise.all(documentIds.map(async (documentId) => {
                const data = await VoidApiClient.getDocument(voidId, documentId);
                const text = await data.text();
                const title = /[# ]*(.*?)[# ]*$/.exec(text)?.[1] || 'Untitled';
                return {
                    voidId,
                    documentId,
                    data: data,
                    text,
                    title,
                }
            })))
        })();
    }, [documentIds]);

    return <>
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '10px',
                    alignItems: 'center',
                }}
            >
                <button
                    onClick={() => routeContext.setVoidId(undefined)}
                >Back</button>
                <span>{routeContext.voidId}</span>
            </div>
            <input type="text" name="searchbar" id="searchbar" />
            {
                documentData.map((doc) => {
                    return <button
                        key={doc.documentId}
                        onClick={() => {
                            routeContext.setDocumentId(doc.documentId);
                        }}
                    >
                        {doc.title}
                    </button>
                })
            }
        </div>
    </>
}

export default DocumentSelector;
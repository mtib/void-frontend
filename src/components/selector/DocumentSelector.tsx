import { FC, useEffect, useState } from "react";
import { DocumentId, useRouteContext, VoidId } from "../../context/RouteContext";
import VoidApiClient from "../../api/VoidApiClient";
import Editor from "../document/editor/Editor";
import { useCurrentVoidLocalStorage } from "../../context/VoidContext";
import { useStorageContext } from "../../context/StorageContext";

const extractTitle = (text: string) => {
    const firstNewline = text.indexOf('\n');
    const firstLine = firstNewline == -1 ? text : text.substring(-1, firstNewline);
    return firstLine.length > 0 ? (() => {
        const regexp = /^[# ]*(.*?)[# ]*$/;
        return regexp.exec(firstLine)?.[1] ?? undefined;
    })() : undefined;
};

const DocumentSelector: FC = () => {
    const routeContext = useRouteContext();
    const storageContext = useStorageContext();

    const [documentIds, setDocumentIds] = useState<DocumentId[]>([]);

    const [searchText, setSearchText] = useState<string>('');

    const [voidNameEditing, setVoidNameEditing] = useState(false);

    const [documentEditMode, setDocumentEditMode] = useState(false);

    useEffect(() => {
        setDocumentIds([]);
        const voidId = routeContext.voidId;
        if (!voidId) {
            return;
        }
        (async () => {
            // todo cancel / discard if voidId changes
            const data = await VoidApiClient.getDocuments(voidId);
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
                const title = extractTitle(text) ?? documentId;
                return {
                    voidId,
                    documentId,
                    data: data,
                    text,
                    title,
                };
            })));
        })();
    }, [documentIds]);

    const [tempVoidName, setTempVoidName] = useState<string | undefined>(undefined);
    const localVoidData = useCurrentVoidLocalStorage();

    useEffect(() => {
        if (!localVoidData) {
            setTempVoidName(undefined);
            return;
        }
        setTempVoidName(localVoidData.name);
    }, [localVoidData]);

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
                    alignItems: 'stretch',
                }}
            >
                <button
                    onClick={() => {
                        routeContext.setDocumentId(undefined);
                        routeContext.setVoidId(undefined);
                    }}
                >Back</button>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: 1,
                    }}
                >
                    <span>
                        {voidNameEditing
                            ? <input
                                value={tempVoidName}
                                onChange={(e) => {
                                    setTempVoidName(e.target.value);
                                }}
                            ></input>
                            : <b>
                                {
                                    localVoidData?.name || 'Unnamed'
                                }
                            </b>
                        }
                    </span>
                    <span
                        style={{
                            color: 'gray',
                            fontSize: 'small',
                        }}
                    >
                        {routeContext.voidId}
                    </span>
                </div>
                <button
                    onClick={() => {
                        if (voidNameEditing) {
                            storageContext.updateVoid(routeContext.voidId, it => ({
                                ...it,
                                name: tempVoidName,
                            }));
                        }
                        setVoidNameEditing(it => !it);
                    }}
                >
                    {voidNameEditing ? 'Save' : 'Rename'}
                </button>
            </div>
            <button
                onClick={() => {
                    const voidId = routeContext.voidId;
                    if (!voidId) {
                        return;
                    }
                    setDocumentEditMode(true);
                    (async () => {
                        const newDocument = await VoidApiClient.createDocument(voidId, undefined);
                        routeContext.setVoidId(newDocument.voidId);
                        routeContext.setDocumentId(newDocument.documentId);
                        setDocumentData(documentData => [{
                            voidId: newDocument.voidId,
                            documentId: newDocument.documentId,
                            data: new Blob([]),
                            text: '',
                            title: newDocument.documentId,
                        }, ...documentData]);
                    })();
                }}
            >
                Create
            </button>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '10px',
                    alignItems: 'center',
                }}
            >
                <span>Regex</span>
                <input
                    type="text"
                    name="searchbar"
                    id="searchbar"
                    style={{
                        flexGrow: 1,
                    }}
                    value={searchText}
                    onChange={(e) => {
                        setSearchText(e.target.value);
                    }}
                />
            </div>
            {
                documentData
                    .filter((doc) => {
                        try {
                            return doc.text.match(new RegExp(searchText, 'i'));
                        } catch (e) {
                            console.error(e);
                            return true;
                        }
                    })
                    .map((doc) => {
                        return <div
                            key={doc.documentId}
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '10px',
                                alignItems: 'center',
                            }}
                        >
                            <button
                                onClick={() => {
                                    setDocumentEditMode(false);
                                    routeContext.setDocumentId(doc.documentId);
                                }}
                                style={{
                                    flexGrow: 1,
                                }}
                            >
                                {doc.title}
                            </button>
                            <button
                                onClick={() => {
                                    setDocumentEditMode(true);
                                    routeContext.setDocumentId(doc.documentId);
                                }}
                            >
                                Edit
                            </button>
                        </div>;
                    })
            }
            {routeContext.documentId && <Editor
                editMode={documentEditMode}
                setEditMode={setDocumentEditMode}
                initialDocument={routeContext.documentId}
                updateData={(data) => {
                    setDocumentData(documentData => {
                        const index = documentData.findIndex(doc => doc.documentId === routeContext.documentId);
                        if (index === -1) {
                            return documentData;
                        }
                        const newDocumentData = [...documentData];
                        newDocumentData[index] = {
                            ...newDocumentData[index],
                            text: data,
                            title: extractTitle(data) ?? newDocumentData[index].documentId,
                        };
                        return newDocumentData;
                    });
                }}
            />}

        </div>
    </>;
};

export default DocumentSelector;

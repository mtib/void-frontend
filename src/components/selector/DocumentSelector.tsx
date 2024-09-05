import { FC, useEffect, useState } from "react";
import { DocumentId, useRouteContext, VoidId } from "../../context/RouteContext";
import VoidApiClient from "../../api/VoidApiClient";
import Editor from "../document/editor/Editor";
import { useCurrentVoidLocalStorage, useVoidBackgroundColor, useVoidPrimaryColor } from "../../context/VoidContext";
import { useStorageContext } from "../../context/StorageContext";
import { ThemedButton, VoidStyledButton, VoidThemeProvider } from "../button";

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

    const primaryColor = useVoidPrimaryColor();
    const backgroundColor = useVoidBackgroundColor();

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
        title: string | undefined,
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
                const title = extractTitle(text) || undefined;
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

    const [settingsMode, setSettingsMode] = useState(false);

    return <>
        <VoidThemeProvider>
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
                    <VoidStyledButton
                        onClick={() => {
                            routeContext.setDocumentId(undefined);
                            routeContext.setVoidId(undefined);
                        }}
                    >
                        Back
                    </VoidStyledButton>
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
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            storageContext.updateVoid(routeContext.voidId, it => ({
                                                ...it,
                                                name: tempVoidName,
                                            }));
                                            setVoidNameEditing(it => !it);
                                        }
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
                    <VoidStyledButton
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
                    </VoidStyledButton>
                    <VoidStyledButton
                        onClick={() => {
                            setSettingsMode(it => !it);
                        }}
                    >
                        {settingsMode ? 'Documents' : 'Settings'}
                    </VoidStyledButton>
                </div>
                {!settingsMode && <>
                    <VoidStyledButton
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
                        Create document
                    </VoidStyledButton>
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
                                    <VoidStyledButton
                                        onClick={() => {
                                            setDocumentEditMode(false);
                                            routeContext.setDocumentId(doc.documentId);
                                        }}
                                        style={{
                                            flexGrow: 1,
                                        }}
                                    >
                                        {doc.title
                                            ? <span>{doc.title}</span>
                                            : <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                }}
                                            >
                                                <span>
                                                    Untitled document
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: '0.8em',
                                                        color: 'gray',
                                                    }}
                                                >
                                                    {doc.documentId}
                                                </span>
                                            </div>}
                                    </VoidStyledButton>
                                    <VoidStyledButton
                                        onClick={() => {
                                            setDocumentEditMode(true);
                                            routeContext.setDocumentId(doc.documentId);
                                        }}
                                    >
                                        Edit
                                    </VoidStyledButton>
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
                                    title: extractTitle(data),
                                };
                                return newDocumentData;
                            });
                        }}
                    />}
                </>}
                {settingsMode && <>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            borderRadius: '18px',
                            padding: '10px',
                            border: `1px solid ${primaryColor}`,
                            backgroundColor,
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '10px',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <span
                                style={{
                                    padding: '0 10px 0 10px'
                                }}
                            >
                                <b>
                                    Password
                                </b>
                            </span>
                            <span>
                                {
                                    storageContext.knownVoids.find(it => it.id === routeContext.voidId)?.password || 'None'
                                }
                            </span>
                            <VoidStyledButton>
                                Change
                            </VoidStyledButton>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '10px',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <span
                                style={{
                                    padding: '10px'
                                }}
                            >
                                <b>
                                    Color
                                </b>
                            </span>
                            <input
                                value={storageContext.knownVoids.find(it => it.id === routeContext.voidId)?.color || primaryColor}
                                onChange={(e) => {
                                    storageContext.updateVoid(routeContext.voidId, it => ({
                                        ...it,
                                        color: e.target.value,
                                    }));
                                }}
                                style={{
                                    flexGrow: 1,
                                    backgroundColor: backgroundColor,
                                    borderColor: primaryColor,
                                    padding: '10px',
                                    borderRadius: '10px',
                                    borderWidth: '1px',
                                    borderStyle: 'solid',
                                    fontFamily: 'monospace',
                                }}
                            >
                            </input>
                            <ThemedButton
                                onClick={() => {
                                    storageContext.updateVoid(routeContext.voidId, it => ({
                                        ...it,
                                        color: undefined,
                                    }));
                                }}
                            >
                                Reset
                            </ThemedButton>
                        </div>
                    </div>
                </>}
            </div>
        </VoidThemeProvider>
    </>;
};

export default DocumentSelector;

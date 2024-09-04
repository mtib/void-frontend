import { FC, PropsWithChildren, useCallback, useEffect, useState } from "react";
import { DocumentId, useRouteContext } from "../../../context/RouteContext";
import VoidApiClient from "../../../api/VoidApiClient";

const outlineColor = '#a06ca0';
const backgroundColor = '#1a041a';


const Editor: FC<PropsWithChildren<{
    initialDocument: DocumentId;
    updateData: (data: string) => void;
}>> = ({
    initialDocument,
    updateData,
}) => {
        const routeContext = useRouteContext();

        const [data, setData] = useState<string | undefined>(undefined);

        useEffect(() => {
            const voidId = routeContext.voidId;
            if (!initialDocument || !voidId) {
                return;
            }
            (async () => {
                const data = await VoidApiClient.getDocument(voidId, initialDocument);
                setData(await data.text());
            })();
        }, [initialDocument]);

        const forceUpdate = useCallback(() => {
            const voidId = routeContext.voidId;
            if (!voidId) {
                return;
            }
            (async () => {
                const encoding = new TextEncoder();
                await VoidApiClient.updateDocument(voidId, initialDocument, new Blob([encoding.encode(data)]));
            })();
        }, [data]);

        useEffect(() => {
            updateData(data ?? '');
            if (!data) {
                return;
            }
            const voidId = routeContext.voidId;
            if (!voidId) {
                return;
            }
            let cancelled = false;
            setTimeout(() => {
                if (cancelled) {
                    return;
                }
                forceUpdate();
            }, 400);
            return () => {
                cancelled = true;
            };
        }, [data]);

        return <>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    right: '10px',
                    borderRadius: '10px',
                    background: backgroundColor,
                    borderColor: outlineColor,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    minHeight: 'calc(100vh - 40px)',
                    padding: '10px',
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                    }}
                >
                    <button
                        onClick={() => {
                            forceUpdate();
                            routeContext.setDocumentId(undefined);
                        }}
                    >
                        Back
                    </button>
                </div>
                <textarea
                    name="editor"
                    id="editor"
                    value={data}
                    rows={20}
                    onChange={(e) => {
                        setData(e.target.value);
                    }}
                >
                </textarea>
            </div>
        </>;
    };

export default Editor;
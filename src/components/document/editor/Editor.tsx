import { FC, PropsWithChildren, useCallback, useEffect, useState } from "react";
import { DocumentId, useRouteContext } from "../../../context/RouteContext";
import VoidApiClient from "../../../api/VoidApiClient";
import showdown from "showdown";
import { useVoidBackgroundColor, useVoidPrimaryColor } from "../../../context/VoidContext";
import Button from "../../button/Button";
import TextArea from "../../input/textarea/TextArea";

const Editor: FC<PropsWithChildren<{
    initialDocument: DocumentId;
    editMode: boolean;
    setEditMode: (editMode: boolean) => void;
    updateData: (data: string) => void;
}>> = ({
    initialDocument,
    updateData,
    editMode,
    setEditMode,
}) => {
        const routeContext = useRouteContext();

        const primaryColor = useVoidPrimaryColor();
        const backgroundColor = useVoidBackgroundColor();
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

        const [html, setHtml] = useState<string | undefined>(undefined);

        useEffect(() => {
            if (editMode) {
                return;
            }
            if (!data) {
                return;
            }
            setHtml(new showdown.Converter().makeHtml(data));
        }, [editMode, data]);

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
                    borderRadius: '18px',
                    background: backgroundColor,
                    borderColor: primaryColor,
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
                        gap: "10px",
                    }}
                >
                    <Button
                        onClick={() => {
                            forceUpdate();
                            routeContext.setDocumentId(undefined);
                        }}
                    >
                        Back
                    </Button>
                    <Button
                        onClick={() => {
                            setEditMode(!editMode);
                        }}
                    >
                        {editMode ? 'Preview' : 'Edit'}
                    </Button>
                </div>
                {editMode &&
                    <TextArea
                        name="editor"
                        id="editor"
                        value={data}
                        onChange={(e) => {
                            setData(e.target.value);
                        }}
                    />
                }
                {!editMode && html &&
                    <div
                        dangerouslySetInnerHTML={{ __html: html }}
                        style={{
                            textAlign: 'left',
                            paddingLeft: '10px',
                            paddingRight: '10px',
                        }}
                    >
                    </div>
                }
            </div>
        </>;
    };

export default Editor;

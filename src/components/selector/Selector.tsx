import { FC } from "react";
import VoidSelector from "./VoidSelector";
import { useRouteContext } from "../../context/RouteContext";
import DocumentSelector from "./DocumentSelector";

const Selector: FC = () => {
    const routeContext = useRouteContext();

    if (!routeContext.voidId) {
        return <>
            {<VoidSelector />}
        </>
    }

    return <>
        {<DocumentSelector />}
    </>
};

export default Selector;
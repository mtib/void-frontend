import './VoidApp.css';
import Background from './components/background/Background';
import { StorageContextProvider } from './context/StorageContext';
import { RouteContextProvider } from './context/RouteContext';
import { VoidContextProvider } from './context/VoidContext';
import { DocumentContextProvider } from './context/DocumentContext';
import Selector from './components/selector/Selector';

function VoidApp() {
  return (
    <>
      <StorageContextProvider>
        <RouteContextProvider>
          <VoidContextProvider>
            <DocumentContextProvider>
              <h1>VOID</h1>
              <Selector />
              <Background />
            </DocumentContextProvider>
          </VoidContextProvider>
        </RouteContextProvider>
      </StorageContextProvider>
    </>
  );
}

export default VoidApp;

import './VoidApp.css';
import Background from './components/background/Background';
import { StorageContextProvider } from './context/StorageContext';
import { RouteContextProvider } from './context/RouteContext';
import { VoidContextProvider } from './context/VoidContext';
import { DocumentContextProvider } from './context/DocumentContext';
import Selector from './components/selector/Selector';
import { ThemeProvider } from 'styled-components';
import { outlineColor } from "./consts";
import { backgroundColor } from "./consts";

function VoidApp() {
  return (
    <>
      <StorageContextProvider>
        <RouteContextProvider>
          <VoidContextProvider>
            <DocumentContextProvider>
              <ThemeProvider theme={{
                fg: outlineColor,
                bg: backgroundColor,
              }}>
                <h1>VOID</h1>
                <Selector />
                <Background />
              </ThemeProvider>
            </DocumentContextProvider>
          </VoidContextProvider>
        </RouteContextProvider>
      </StorageContextProvider>
    </>
  );
}

export default VoidApp;

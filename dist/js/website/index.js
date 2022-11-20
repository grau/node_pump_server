/**
 * @file Webseite entry
 */
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
// import '@fontsource/roboto/300.css';
// import '@fontsource/roboto/400.css';
// import '@fontsource/roboto/500.css';
// import '@fontsource/roboto/700.css';
import { Root } from './root.js';
import { useWorker } from './webWorker.js';
const container = document.getElementById('reactRoot');
if (!container) {
    throw new Error('No root container node found');
}
useWorker();
const theme = createTheme({
    palette: {
        action: {
            selectedOpacity: 0.0,
            hoverOpacity: 1,
            focus: '#ff0000',
            focusOpacity: 1,
        },
    },
});
const root = createRoot(container);
root.render(React.createElement(React.StrictMode, null,
    React.createElement(ThemeProvider, { theme: theme },
        React.createElement(CssBaseline, null),
        React.createElement(Root, null))));

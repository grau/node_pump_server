/**
 * @file React component
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as React from 'react';
import Paper from '@mui/material/Paper';
import FormLabel from '@mui/material/FormLabel';
import Alert from '@mui/material/Alert';
/**
 * Info about the active version
 *
 * @returns React component
 */
export function VersionInfo() {
    const [remoteVersion, setRemoteVersion] = React.useState('???');
    const fetchData = () => __awaiter(this, void 0, void 0, function* () {
        setRemoteVersion((yield (yield fetch('https://raw.githubusercontent.com/grau/node_pump_server/main/package.json')).json()).version);
    });
    React.useEffect(() => {
        fetchData()
            .catch((err) => console.warn('Failed to get version info!', { err }));
        const interval = setInterval(fetchData, 60000);
        return () => {
            clearInterval(interval);
        };
    });
    return React.createElement(React.Fragment, null,
        React.createElement(Paper, { sx: { p: 4, px: 5, mb: 4, display: 'flex', flexDirection: 'column' } },
            React.createElement(FormLabel, null, "Version"),
            '0.1' === remoteVersion
                ? React.createElement(Alert, { severity: 'success' }, "Die installierte Version 0.1 ist aktuell")
                : React.createElement(Alert, { severity: 'error' },
                    "Installiert ist Version 0.1. Version ",
                    remoteVersion,
                    " ist verf\u00FCgbar")));
}

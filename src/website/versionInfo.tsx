/**
 * @file React component
 */

import * as React from 'react';

import Paper from '@mui/material/Paper';
import FormLabel from '@mui/material/FormLabel';
import Alert from '@mui/material/Alert';
import pkg from '../../package.json';



/**
 * Info about the active version
 *
 * @returns React component
 */
export function VersionInfo(): JSX.Element {
    const [remoteVersion, setRemoteVersion] = React.useState<string>('???');

    const fetchData = async () => {
        setRemoteVersion((await (await fetch(
            'https://raw.githubusercontent.com/grau/node_pump_server/main/package.json')).json()).version);
    };

    React.useEffect(() => {
        fetchData()
            .catch((err) => console.warn('Failed to get version info!', {err}));
        const interval = setInterval(fetchData, 60000);
        return () => {
            clearInterval(interval);
        };
    });

    return <>
        <FormLabel>Version</FormLabel>
        <Paper sx={{ p: 4, px: 5, mb: 4, display: 'flex', flexDirection: 'column'}}>
            {pkg.version === remoteVersion
                ? <Alert severity='success'>
                    Die installierte Version {pkg.version} ist aktuell
                </Alert>
                : <Alert severity='error'>
                    Installiert ist Version {pkg.version}. Version {remoteVersion} ist verfügbar
                </Alert>}
        </Paper>
    </>;
}

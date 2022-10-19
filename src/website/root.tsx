/**
 * @file React component
 */

import * as React from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';

import { AppBar } from './appBar.js';
import { Drawer } from './drawer.js';
import { Main } from './main.js';
import type { TViews } from './drawer.js';

/**
 * Root element
 *
 * @returns React component
 */
export function Root(): JSX.Element {
    const [open, setOpen] = React.useState(true);
    const [view, setView] = React.useState<TViews>('live');
    const toggleDrawer = () => {
        setOpen(!open);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar open={open} toggleDrawer={toggleDrawer} />
            <Drawer view={view} open={open} toggleDrawer={toggleDrawer} onChangeView={setView} />
            <Box
                component="main"
                sx={{
                    backgroundColor: (theme) =>
                        theme.palette.mode === 'light'
                            ? theme.palette.grey[100]
                            : theme.palette.grey[900],
                    flexGrow: 1,
                    height: '100vh',
                    overflow: 'auto',
                }}
            >
                <Toolbar />
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    <Main view={view} />
                </Container>
            </Box>
        </Box>
    );
}

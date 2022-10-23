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
/**
 * Root element
 *
 * @returns React component
 */
export function Root() {
    const [open, setOpen] = React.useState(true);
    const [view, setView] = React.useState('live');
    const toggleDrawer = () => {
        setOpen(!open);
    };
    return (React.createElement(Box, { sx: { display: 'flex' } },
        React.createElement(AppBar, { open: open, toggleDrawer: toggleDrawer }),
        React.createElement(Drawer, { view: view, open: open, toggleDrawer: toggleDrawer, onChangeView: setView }),
        React.createElement(Box, { component: "main", sx: {
                backgroundColor: (theme) => theme.palette.mode === 'light'
                    ? theme.palette.grey[100]
                    : theme.palette.grey[900],
                flexGrow: 1,
                height: '100vh',
                overflow: 'auto',
            } },
            React.createElement(Toolbar, null),
            React.createElement(Container, { maxWidth: "lg", sx: { mt: 4, mb: 4 } },
                React.createElement(Main, { view: view })))));
}

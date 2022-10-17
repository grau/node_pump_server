/**
 * @file React component
 */

import * as React from 'react';
import { styled } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
// import Badge from '@mui/material/Badge';
import type { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';

import MenuIcon from '@mui/icons-material/Menu';
// import NotificationsIcon from '@mui/icons-material/Notifications';

import { drawerWidth } from './drawer';

/**
 * React properties
 */
interface AppBarElemProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBarElem = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarElemProps>(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

/** React properties */
interface Props {
    /** If the drawer is open */
    open: boolean;
    /** Toggle the drawer state */
    toggleDrawer: () => void;
}

/**
 * App bar on top
 *
 * @param props React properties
 * @returns React component
 */
export function AppBar(props: Props): JSX.Element {
    const {open, toggleDrawer} = props;
    return <AppBarElem position="absolute" open={open}>
        <Toolbar
            sx={{
                pr: '24px', // keep right padding when drawer closed
            }}
        >
            <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={toggleDrawer}
                sx={{
                    marginRight: '36px',
                    ...(open && { display: 'none' }),
                }}
            >
                <MenuIcon />
            </IconButton>
            <Typography
                component="h1"
                variant="h6"
                color="inherit"
                noWrap
                sx={{ flexGrow: 1 }}
            >
                Dashboard
            </Typography>
            {/* <IconButton color="inherit">
                <Badge badgeContent={4} color="secondary">
                    <NotificationsIcon />
                </Badge>
            </IconButton> */}
        </Toolbar>
    </AppBarElem>;
}

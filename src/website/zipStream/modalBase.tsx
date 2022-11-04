/**
 * @file React component
 */

import * as React from 'react';
import {useState} from 'react';

import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Backdrop from '@mui/material/Backdrop';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';

import type {SxProps} from '@mui/material';

/**
 * Properties for the delete modal dialog
 */
export interface IProps {
    /** Callback when modal closes */
    onClose: () => void;
    /** Title of modal */
    title: string;
    /** Body of modal */
    children: React.ReactNode;
    /** Definition of buttons */
    buttonDefs: IModalButton[];
}

/** A single button inside a modal */
export interface IModalButton {
    /** Button text */
    title: string;
    /** Button icon (optional) */
    icon?: JSX.Element;
    /** Button function */
    fu?: () => Promise<void> | void;
    /** If Modal should be closed after function has been processed (default: true) */
    shouldClose?: boolean;
    /** Optional - button color. If set button is contained */
    color?: string;
}

/**
 * Base modal dialog
 *
 * @param props React properties
 * @returns React component
 */
export function ModalBase(props: IProps): JSX.Element {
    const {onClose, title, children, buttonDefs} = props;
    const [ isOpen, setIsOpen ] = useState<boolean>(true);

    // Add a 500ms delay to the close action to allow the fade process to fade out the modal dialog.
    const closeHandler = (): void => {
        setIsOpen(false);
        setTimeout(onClose, 500);
    };

    /** CSS Style of modal dialog */
    const dialogStyle: SxProps = {
        position: 'absolute' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        border: '2px solid #000',
        pt: 2,
        px: 4,
        pb: 3,
    };

    const buttons = buttonDefs.map((buttonDef, index) =>
        (<Button
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            startIcon={buttonDef.icon}
            sx={{backgroundColor: buttonDef.color}}
            variant={buttonDef.color === undefined ? 'outlined' : 'contained'}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={async(): Promise<void> => {
                const {fu} = buttonDef;
                if (fu !== undefined) {
                    await fu();
                }
                if (buttonDef.shouldClose !== false) {
                    closeHandler();
                }
            }} >
            {buttonDef.title}
        </Button>)
    );

    return (<Modal
        open={isOpen}
        onClose={closeHandler}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
            timeout: 500,
        }}
    >
        <Fade in={isOpen}>
            <Container maxWidth='md'>
                <Paper sx={dialogStyle}>
                    <Typography
                        variant='h4'
                        component='h4'>
                        {title}
                    </Typography>
                    <div>
                        {children}
                    </div>
                    <ButtonGroup
                        sx={{pt: 3, pr: 1}}
                        color='primary'>
                        {buttons}
                    </ButtonGroup>
                </Paper>
            </Container>
        </Fade>
    </Modal>);
}

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
import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Backdrop from '@mui/material/Backdrop';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
/**
 * Base modal dialog
 *
 * @param props React properties
 * @returns React component
 */
export function ModalBase(props) {
    const { onClose, title, children, buttonDefs } = props;
    const [isOpen, setIsOpen] = useState(true);
    // Add a 500ms delay to the close action to allow the fade process to fade out the modal dialog.
    const closeHandler = () => {
        setIsOpen(false);
        setTimeout(onClose, 500);
    };
    /** CSS Style of modal dialog */
    const dialogStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        border: '2px solid #000',
        pt: 2,
        px: 4,
        pb: 3,
    };
    const buttons = buttonDefs.map((buttonDef, index) => (React.createElement(Button
    // eslint-disable-next-line react/no-array-index-key
    , { 
        // eslint-disable-next-line react/no-array-index-key
        key: index, startIcon: buttonDef.icon, sx: { backgroundColor: buttonDef.color }, variant: buttonDef.color === undefined ? 'outlined' : 'contained', 
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick: () => __awaiter(this, void 0, void 0, function* () {
            const { fu } = buttonDef;
            if (fu !== undefined) {
                yield fu();
            }
            if (buttonDef.shouldClose !== false) {
                closeHandler();
            }
        }) }, buttonDef.title)));
    return (React.createElement(Modal, { open: isOpen, onClose: closeHandler, closeAfterTransition: true, BackdropComponent: Backdrop, BackdropProps: {
            timeout: 500,
        } },
        React.createElement(Fade, { in: isOpen },
            React.createElement(Container, { maxWidth: 'md' },
                React.createElement(Paper, { sx: dialogStyle },
                    React.createElement(Typography, { variant: 'h4', component: 'h4' }, title),
                    React.createElement("div", null, children),
                    React.createElement(ButtonGroup, { sx: { pt: 3, pr: 1 }, color: 'primary' }, buttons))))));
}

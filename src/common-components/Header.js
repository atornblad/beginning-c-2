import React, { Component } from 'react';
import './Header.css';

export default class Header extends Component {
    render() {
        const buttons = [
            { id: 'new', title: 'New' },
            { id: 'open', title: 'Open' },
            { id: 'save', title: 'Save' },
            { id: 'saveAs', title: 'Save as' },
            { separator: true },
            { id: 'print', title: 'Print' },
            { separator: true },
            { id: 'compile', title: 'Compile' },
            { id: 'run', title: 'Run' }
        ].reduce((array, button) =>
            [...array, (
                button.separator ? button :
                    this.props.buttons[button.id] ? Object.assign({}, button, this.props.buttons[button.id]) :
                        button
            )], []);

        return (
            <header>
                <nav className="toolbar">
                    <ul>
                        {buttons.map((button, index) =>
                            button.separator ? (<li key={`separator_${index}`} className="separator"></li>) :
                                button.show ? (<li key={button.id}><button onClick={button.onClick} disabled={!button.enable}>{button.title}</button></li>) :
                                    null
                        )}
                    </ul>
                </nav>
            </header>
        )
    }
}

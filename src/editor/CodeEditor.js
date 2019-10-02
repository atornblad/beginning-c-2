import React, { Component } from 'react';
import { ControlledEditor } from '@monaco-editor/react';

class CodeEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            options: {
                selectOnLineNumbers: true
            }
        }
        this.code = props.code;
        this.originalCode = props.code;
        this.setHasCode(props.code && props.code.length >= 1);
        this.setHasChanges(false);
    }

    getValue() {
        return this.code;
    }

    setHasChanges(newValue) {
        if (this.hasChanges !== newValue) {
            this.hasChanges = newValue;
            if (this.props.onHasChangesUpdated) {
                this.props.onHasChangesUpdated(newValue);
            }
        }
    }

    setHasCode(newValue) {
        if (this.hasCode !== newValue) {
            this.hasCode = newValue;
            if (this.props.onHasCodeUpdated) {
                this.props.onHasCodeUpdated(newValue);
            }
        }
    }

    onChange(e, newValue) {
        this.code = newValue;
        this.setHasChanges(newValue !== this.originalCode);
        this.setHasCode(newValue.length >= 1);
    }

    render() {
        const { code, options } = this;
        console.log('rendering');

        return (
            <ControlledEditor
                height="100%"
                language="c"
                theme="vs-dark"
                value={code}
                options={options}
                onChange={this.onChange.bind(this)}
            />
        )
    }
}

export default CodeEditor;

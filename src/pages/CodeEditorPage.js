import React, { Component } from 'react';
import Header from '../common-components/Header';
import CodeEditor from '../editor/CodeEditor';
import StageOneProcessor from '../compilation/StageOneProcessor';
import Preprocessor from '../compilation/Preprocessor';
import Compiler from '../compilation/Compiler';

export default class CodeEditorPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            editorHasChanges: false,
            editorHasCode: false,
            ast: null
        }

        this.editorRef = React.createRef();
        this.outputRef = React.createRef();
    }

    onEditorHasChangesUpdated(newValue) {
        this.setState({
            editorHasChanges: newValue
        });
    }

    onEditorHasCodeUpdated(newValue) {
        this.setState({
            editorHasCode: newValue
        });
    }

    async onCompileButtonClicked() {
        const stageOne = new StageOneProcessor(this.editorRef.current.getValue());
        const cleanedCodeLines = await stageOne.processAndGetLines();

        const preprocessor = new Preprocessor(cleanedCodeLines);
        const code = await preprocessor.preprocess();

        const compiler = new Compiler(code);

        try {
            const ast = await compiler.generateAst();
            this.outputRef.current.value = JSON.stringify(ast, null, '  ');
        }
        catch (e) {
            this.outputRef.current.value = e;
        }
    }

    render() {
        return (
            <>
                <Header buttons={{
                    new: { show: true, enable: true },
                    open: { show: true, enable: true },
                    save: { show: true, enable: this.state.editorHasChanges },
                    compile: { show: true, enable: this.state.editorHasCode, onClick: this.onCompileButtonClicked.bind(this) },
                    run: { show: true, enable: this.state.ast }
                }} />
                <CodeEditor
                    code={"#define ONE 1\n\nint main() {\n    return ONE + TWO;\n}\n"}
                    onHasChangesUpdated={this.onEditorHasChangesUpdated.bind(this)}
                    onHasCodeUpdated={this.onEditorHasCodeUpdated.bind(this)}
                    ref={this.editorRef}
                />
                <textarea id="output" rows="10" ref={this.outputRef}></textarea>
            </>
        );
    }
}

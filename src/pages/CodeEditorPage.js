import React, { Component } from 'react';
import Header from '../common-components/Header';
import CodeEditor from '../editor/CodeEditor';
import StageOneProcessor from '../compilation/StageOneProcessor';
import Preprocessor from '../compilation/Preprocessor';
import Compiler from '../compilation/Compiler';
import Generator from '../compilation/Generator';

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
        console.log(this);
        const stageOne = new StageOneProcessor(this.editorRef.current.getValue());
        const cleanedCodeLines = await stageOne.processAndGetLines();

        const preprocessor = new Preprocessor(cleanedCodeLines);
        const code = await preprocessor.preprocess();

        const compiler = new Compiler(code);

        try {
            const ast = await compiler.generateAst();

            const generator = new Generator(ast);
            const exe = await generator.generate();

            this.outputRef.current.value = `Compiled!
Total global variables: ${exe.$memBottom} bytes`;
            this.setState({exe});
        }
        catch (e) {
            this.outputRef.current.value = e;
        }
    }

    async onRunButtonClicked() {
        console.log(this);
        await this.state.exe.$prolog();
        const ram = Array.from(Array(this.state.exe.$memBottom)).map((_, i) => `${i}: ${this.state.exe.$memory[i]}`).join('\n');
        this.outputRef.current.value = `RAM contents: \n${ram}`;
    }

    render() {
        return (
            <>
                <Header buttons={{
                    new: { show: true, enable: true },
                    open: { show: true, enable: true },
                    save: { show: true, enable: this.state.editorHasChanges },
                    compile: { show: true, enable: this.state.editorHasCode, onClick: this.onCompileButtonClicked.bind(this) },
                    run: { show: true, enable: this.state.exe, onClick: this.onRunButtonClicked.bind(this) }
                }} />
                <CodeEditor
                    code={"#define ONE 1\n\nconst int x = ONE;\n\nint main() {\n    return ONE + x;\n}\n"}
                    onHasChangesUpdated={this.onEditorHasChangesUpdated.bind(this)}
                    onHasCodeUpdated={this.onEditorHasCodeUpdated.bind(this)}
                    ref={this.editorRef}
                />
                <textarea id="output" rows="10" ref={this.outputRef}></textarea>
            </>
        );
    }
}

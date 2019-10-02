import React, { Component } from 'react';
import Header from '../common-components/Header';
import CodeEditor from '../editor/CodeEditor';
import Precompiler from '../compilation/Precompiler';
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
        const precompiler = new Precompiler(this.editorRef.current.getValue());
        const code = await precompiler.precompile();

        const compiler = new Compiler(code);

        try {
            const ast = await compiler.generateAst();
            console.log(JSON.stringify(ast, null, '  '));
        }
        catch (e) {
            console.error(e);
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
                    code={"int main() {\n    return 1+2;\n}\n"}
                    onHasChangesUpdated={this.onEditorHasChangesUpdated.bind(this)}
                    onHasCodeUpdated={this.onEditorHasCodeUpdated.bind(this)}
                    ref={this.editorRef}
                />
            </>
        );
    }
}

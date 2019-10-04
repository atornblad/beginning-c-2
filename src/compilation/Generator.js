const AsyncFunction = Object.getPrototypeOf(async function() { }).constructor;

const RAM_SIZE = 65536;
const POINTER_SIZE = 2;
const INT_SIZE = 4;

const typeSizes = {
    'char' : 1,
    'char|signed' : 1,
    'char|unsigned' : 1,
    'int' : INT_SIZE,
    'int|signed' : INT_SIZE,
    'int|unsigned' : INT_SIZE,
    'int|long' : 4,
    'long' : 4,
    'int|long|unsigned' : 4,
    'long|unsigned' : 4,
    'int|long|signed' : 4,
    'long|signed' : 4,
    'int|short' : 2,
    'short' : 2,
    'int|short|signed' : 2,
    'short|signed' : 2,
    'int|short|unsigned' : 2,
    'short|unsigned' : 2
};

const viewSetters = {
    'char' : 'setInt8',
    'char|signed' : 'setInt8',
    'char|unsigned' : 'setUint8',
    'int' : 'setInt32',
    'int|signed' : 'setInt32',
    'int|unsigned' : 'setUint32',
    'int|long' : 'setInt32',
    'long' : 'setInt32',
    'int|long|unsigned' : 'setUint32',
    'long|unsigned' : 'setUint32',
    'int|long|signed' : 'setInt32',
    'long|signed' : 'setInt32',
    'int|short' : 'setInt16',
    'short' : 'setInt16',
    'int|short|signed' : 'setInt16',
    'short|signed' : 'setInt16',
    'int|short|unsigned' : 'setUint16',
    'short|unsigned' : 'setUint16'
};

const getTypeInfo = function(defType) {
    switch (defType.type) {
        case 'PointerType':
            return POINTER_SIZE;
        case 'Type':
            const typeAndModifiers = new Set([...defType.modifier, defType.name]);
            typeAndModifiers.delete('const');
            typeAndModifiers.delete('static');
            typeAndModifiers.delete('volatile');
            const typeName = Array.from(typeAndModifiers);
            typeName.sort();
            const finalName = typeName.join('|');
            return {
                name : finalName,
                size : typeSizes[finalName],
                viewSetter : viewSetters[finalName]
            };
        default:
            throw new Error(`Unknown defType.type '${defType.type}'`);
    }
};

const generateSetVariableAt = async function(scope, address, info, expression) {
    switch (expression.type) {
        case 'Literal':
            // TODO: Convert to correct binary format
            return `{
    const temp = new ArrayBuffer(${info.size});
    const view = new DataView(temp);
    view.${info.viewSetter}(0, ${expression.value}, true);
    this.$memory.set(new Uint8Array(temp), ${address});
}`;
        default:
            throw new Error(`Not yet implemented: '${expression.type}' type expressions`);
    }
}

const generateSetVariable = async function(scope, decl, expression) {
    if (decl.address !== (void 0)) {
        return await generateSetVariableAt(scope, decl.address, decl.info, expression);
    }
};

const addGlobalVariableDeclaration = async function(declaration, scope, result) {
    const info = getTypeInfo(declaration.defType);
    const address = result.$memBottom;

    scope[declaration.name] = {
        declaration: declaration,
        type : declaration.defType.name || declaration.defType.type,
        address: address,
        info : info
    };

    result.$memBottom += info.size;

    if (declaration.value !== (void 0)) {
        result.$prologCode += await generateSetVariable(scope, scope[declaration.name], declaration.value);
    }
};

const addFunctionDeclaration = async function(declaration, scope, result) {
    
};

const addGlobalDeclaration = async function(declaration, scope, result) {
    switch (declaration.type) {
        case 'GlobalVariableDeclaration':
            await addGlobalVariableDeclaration(declaration, scope, result);
            break;
        case 'FunctionDeclaration':
            await addFunctionDeclaration(declaration, scope, result);
            break;
        default:
            throw new Error(`Unexpected global declaration type '${declaration.type}'`);
    }
    console.log(declaration);
}

const generateFromAst = async function(ast) {
    const identifierScope = { };
    const result = {
        $memory : new Uint8ClampedArray(65536),
        $memBottom : 0,
        $prologCode : 'this.$memory.fill(0);\n'
    }
    for (const declaration of ast) {
        await addGlobalDeclaration(declaration, identifierScope, result);
    }
    console.log(result.$prologCode);
    result.$prolog = new AsyncFunction(result.$prologCode);

    return result;
};

class Generator {
    constructor(ast) {
        this.ast = ast;
    }

    async generate() {
        return await generateFromAst(this.ast);
    }
}


/*

{
    $memory : null // new Uint8Array(65536),
    main : async function() {
    }
    $prolog : async function() {

    }
}

*/



export default Generator;
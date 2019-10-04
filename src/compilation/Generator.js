const AsyncFunction = Object.getPrototypeOf(async function() { }).constructor;

const RAM_SIZE = 65536;
const POINTER_SIZE = 2;
const INT_SIZE = 4;

const typeSizes = {
    'char' : 1,
    'int' : INT_SIZE,
    'int,long' : 4,
    'long' : 4,
    'int,short' : 2,
    'short' : 2
};

const getTypeSize = function(defType) {
    switch (defType.type) {
        case 'PointerType':
            return POINTER_SIZE;
        case 'Type':
            const typeAndModifiers = new Set([...defType.modifier, defType.name]);
            typeAndModifiers.delete('const');
            typeAndModifiers.delete('static');
            typeAndModifiers.delete('volatile');
            typeAndModifiers.delete('signed');
            typeAndModifiers.delete('unsigned');
            const typeName = Array.from(typeAndModifiers);
            typeName.sort();
            return typeSizes[typeName.join(',')];
        default:
            throw new Error(`Unknown defType.type '${defType.type}'`);
    }
};

const generateSetVariableAt = async function(address, size, expression) {
    switch (expression.type) {
        case 'Literal':
            // TODO: Convert to correct binary format
            return `{
    const temp = new ArrayBuffer(4);
    const view = new DataView(temp);
    view.setInt32(0, ${expression.value}, true);
    this.$memory.set(new Uint8Array(temp), ${address});
}`;
        default:
            throw new Error(`Not yet implemented: '${expression.type}' type expressions`);
    }
}

const generateSetVariable = async function(decl, expression) {
    if (decl.address !== (void 0)) {
        return await generateSetVariableAt(decl.address, decl.size, expression);
    }
};

const addGlobalVariableDeclaration = async function(declaration, scope, result) {
    const size = getTypeSize(declaration.defType);
    const address = result.$memBottom;

    scope[declaration.name] = {
        declaration: declaration,
        type : declaration.defType.name || declaration.defType.type,
        address: address,
        size : size
    };

    result.$memBottom += size;

    if (declaration.value !== (void 0)) {
        result.$prologCode += await generateSetVariable(scope[declaration.name], declaration.value);
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
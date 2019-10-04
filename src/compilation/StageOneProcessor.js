const trigraphs = {
    '(' : '[',
    ')' : ']',
    '<' : '{',
    '>' : '}',
    '=' : '#',
    '/' : '\\',
    '\'': '^',
    '!' : '|',
    '-' : '~'
};

const trigraphReplacer = (match, ...groups) => {
    console.log({match, groups});
    return trigraphs[groups[0]] || match;
}

class StageOneProcessor {
    constructor(code) {
        this.rawCode = code;
    }

    async processAndGetLines() {
        const rawLines = this.rawCode.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

        const lines = [];
        let unFinishedLine = '';

        for (const rawLine of rawLines) {
            if (rawLine.endsWith('\\')) {
                unFinishedLine += rawLine.substr(0, rawLine.length - 1);
            }
            else {
                lines.push(unFinishedLine + rawLine);
                unFinishedLine = '';
            }
        }

        const afterTrigraphs = lines.map(line => line.replace(/\?\?(.)/, trigraphReplacer));

        return afterTrigraphs;
    }
}

export default StageOneProcessor;

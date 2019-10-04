import dayjs from 'dayjs';

const punctuators = [
    '+','++','+=',
    '-','--','-=',
    '*','*=',
    '/','/=',
    '%','%=',
    '&','&&','&=',
    '|','||','|=',
    '^', '^=',
    '=', '==',
    '!', '!=',
    '~', '~=',
    '?',':',
    ';',
    '[',']',
    '{','}',
    '(',')',
    ',',
    '.',
    '->',
    '>', '>>', '>=', '>>=',
    '<', '<<', '<=', '<<='
];

const startsOfPunctuators = [...new Set(punctuators.map(p => p.substring(0,1)))];

const isStartOfIdentifier = ch => /^[a-zA-Z_]$/.test(ch);
const isIdentifier = ch => /^[a-zA-Z0-9_]$/.test(ch);
const isSpace = ch => /^\s$/.test(ch);
const isStartOfPunctuation = ch => startsOfPunctuators.includes(ch);
const isPunctuation = token => punctuators.includes(token);
const isDecimalDigit = ch => /^[0-9]$/.test(ch);
const isPreprocessorNumber = ch => /^[0-9a-zA-Z_.]$/.test(ch);

class Preprocessor {
    constructor(lines, filename) {
        this.lines = lines;
        this.definitions = {
            "__FILE__": `"${filename || 'editor'}"`,
            "__LINE__": "0"
        };
    }

    doDefine(rawDefine) {
        const spacePos = rawDefine.indexOf(' ');
        let name;
        let value = true;
        if (spacePos > 0) {
            name = rawDefine.substring(0, spacePos);
            value = rawDefine.substring(spacePos).trim();
        }
        else {
            name = rawDefine.trim();
        }
        this.definitions[name] = value;
    }

    tokenize(lines, subTokens) {
        const tokens = [];
        let lineNo = 0;

        for (const line of lines) {
            if (!subTokens) {
                ++lineNo;
                this.definitions["__LINE__"] = `${lineNo}`;
            }

            let i = 0;

            while (i < line.length) {
                let ch = line[i];
                const tokenStart = i;

                if (isSpace(ch)) {
                    while (isSpace(ch)) {
                        ++i;
                        ch = line[i];
                    }
                    const token = line.substring(tokenStart, i);
                    tokens.push(token);
                }
                else if (isStartOfIdentifier(ch)) {
                    while (isIdentifier(ch)) {
                        ++i;
                        ch = line[i];
                    }
                    const token = line.substring(tokenStart, i);
                    if (this.definitions[token]) {
                        const replacement = this.definitions[token];
                        const replacementTokens = this.tokenize([replacement], true);
                        tokens.push(...replacementTokens);
                    }
                    else {
                        tokens.push(token);
                    }
                }
                else if ((ch === '.' && isDecimalDigit(line[i + 1])) || isDecimalDigit(ch)) {
                    let token = '';
                    while (isPreprocessorNumber(ch)) {
                        token += ch;
                        ++i;
                        const ch2 = line[i];
                        if (/^[eEpP]$/.test(ch) && /^[-+]$/.test(ch2)) {
                            token += ch2;
                            ++i;
                            ch = line[i];
                        }
                        else {
                            ch = ch2;
                        }
                    }
                    tokens.push(token);
                }
                else if (isStartOfPunctuation(ch)) {
                    let token = '';
                    while (isPunctuation(token + ch)) {
                        token += ch;
                        ++i;
                        ch = line[i];
                    }
                    tokens.push(token);
                }
                else if (ch === '\'' || ch === '"') {
                    const endOfToken = ch;
                    let token = ch;
                    ++i;
                    ch = line[i];
                    while (ch !== (void 0) && ch !== endOfToken) {
                        if (ch === '\\') {
                            token += ch;
                            ++i;
                            ch = line[i];
                        }
                        token += ch;
                        ++i;
                        ch = line[i];
                    };
                    if (ch === (void 0)) {
                        throw new Error(`Unexpected end of line inside string literal`);
                    }
                    token += endOfToken;
                    ++i;
                    tokens.push(token);
                }
                else {
                    throw new Error(`Unexpected character '${ch}' (code ${ch.charCodeAt(0)})`);
                }
            }

            if (!subTokens) tokens.push('\n');
        }

        return tokens;
    }

    async preprocess() {
        const now = dayjs();
        this.definitions['__DATE__'] = now.format('"MMM d YYYY"');
        this.definitions['__TIME__'] = now.format('"HH:mm:ss"');

        const outputLines = [];
        for (const line of this.lines) {
            const directiveMatch = /^\s*#(define|undef|include|ifdef|ifndef|if|endif)\s*(.*)$/.exec(line);
            if (directiveMatch) {
                const directive = directiveMatch[1];
                const args = directiveMatch[2];
                switch (directive) {
                    case 'define':
                        this.doDefine(args);
                        outputLines.push('');
                        break;
                    default:
                        throw new Error(`Not yet implemented: ${line.trim()}`);
                }
            }
            else {
                outputLines.push(line);
            }
        }

        const tokens = this.tokenize(outputLines);

        return tokens.join('');
    }
}

export default Preprocessor;

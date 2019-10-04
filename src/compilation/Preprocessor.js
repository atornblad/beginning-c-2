import dayjs from 'dayjs';

const punctuators = [
    '+','++','+=',
    '-','--','-=',
    '*','*=',
    '/','/=',
    '%','%=',
    '&','&&','&=','&&=',
    '|','||','|=','||=',
    '?',':',
    ';',
    '[',']',
    '{','}',
    '(',')',
    ',',
    '.',
    '->'
];

const startsOfPunctuators = [...new Set(punctuators.map(p => p.substring(0,1)))];

console.log({punctuators, startsOfPunctuators});

const isStartOfIdentifier = ch => /[a-zA-Z_]/.test(ch);
const isIdentifier = ch => /[a-zA-Z0-9_]/.test(ch);
const isSpace = ch => /\s/.test(ch);
const isStartOfPunctuation = ch => startsOfPunctuators.includes(ch);
const isPunctuation = token => punctuators.includes(token);

class Preprocessor {
    constructor(lines, filename) {
        this.lines = lines;
        this.definitions = {
            __FILE__: filename || 'editor',
            __LINE__: 0
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

    tokenize(lines) {
        const tokens = [];

        for (const line of lines) {
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
                    console.log({type:'space', tokenStart,i, token});
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
                        const replacementTokens = this.tokenize([replacement]);
                        console.log({type:'replaced_identifier', tokenStart, i, replacementTokens})
                        tokens.push(...replacementTokens);
                    }
                    else {
                        console.log({type:'identifier', tokenStart, i, token});
                        tokens.push(token);
                    }
                }
                else if (isStartOfPunctuation(ch)) {
                    let token = '';
                    while (isPunctuation(token + ch)) {
                        token += ch;
                        ++i;
                        ch = line[i];
                    }
                    console.log({type:'punctuation', tokenStart, i, token});
                    tokens.push(token);
                }
                else {
                    throw `Unexpected character '${ch}' (code ${ch.charCodeAt(0)})`;
                }
            }

            tokens.push('\n');
        }

        console.log({tokens});

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
                        break;
                    default:
                        throw `Not yet implemented: ${line.trim()}`;
                }
                console.log(directiveMatch);
            }
            else {
                outputLines.push(line);
            }
        }

        console.log({outputLines});

        const tokens = this.tokenize(outputLines);

        return tokens.join('');
    }
}

export default Preprocessor;

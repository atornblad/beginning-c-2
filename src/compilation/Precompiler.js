import dayjs from 'dayjs';

class Precompiler {
    constructor(code, filename) {
        this.rawCode = code;
        this.definitions = {
            __FILE__: filename || 'editor',
            __LINE__: 0
        };
    }

    async precompile() {
        const now = dayjs();
        this.definitions['__DATE__'] = now.format('"MMM d YYYY"');
        this.definitions['__TIME__'] = now.format('"HH:mm:ss"');
        console.log(JSON.stringify(this.definitions, null, '  '));

        const includeStack = [ ];

        let pos = 0;
        let line = 1;
        let startOfLine;

        // STATES:
        const START_OF_LINE = 0;
        const INITIAL_LINE_WHITESPACE = 1;
        const AFTER_INITIAL_HASH = 2;
        const NON_PREPROCESSOR_DIRECTIVE = 3;

        let state = START_OF_LINE;
        let currentLine = '';

        this.definitions['__LINE__'] = line;
        let result = [];

        const length = this.rawCode.length;
        while (pos < length) {
            if (state === START_OF_LINE) {
                startOfLine = pos;
                currentLine = '';
                state = INITIAL_LINE_WHITESPACE;
            }

            const ch = this.rawCode.charCodeAt(pos);
            if (ch === 92) { // backslash
                const ch2 = this.rawCode.charCodeAt(pos + 1);
                if (ch2 === 10) {
                    ++line;
                    this.definitions['__LINE__'] = line;
                }
                else {
                    currentLine += '\\';
                    currentLine += String.fromCharCode(ch2);
                }
                pos += 2;
                continue;
            }

            switch (state) {
                case INITIAL_LINE_WHITESPACE:
                    switch (ch) {
                        case 7:
                        case 10:
                        case 32:
                            ++pos;
                            currentLine += String.fromCharCode(ch);
                            break;
                        case 35:    // #
                            state = AFTER_INITIAL_HASH;
                            ++pos;
                            break;
                        default:
                            state = NON_PREPROCESSOR_DIRECTIVE;
                            currentLine += String.fromCharCode(ch);
                            ++pos;
                            break;
                    }
                    break;
                case NON_PREPROCESSOR_DIRECTIVE:
                    switch (ch) {
                        case 10:
                            result.push(currentLine);
                            currentLine = '';
                            ++line;
                            ++pos;
                            this.definitions['__LINE__'] = line;
                            state = START_OF_LINE;
                            break;
                        default:
                            currentLine += String.fromCharCode(ch);
                            ++pos;
                            break;
                    }
                    break;
                case AFTER_INITIAL_HASH:
                default:
                    throw `Not yet implemented: state ${state}`;
                
            }
        }

        return result.join('\n');
    }
}

export default Precompiler;

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

        const pos = 0;
        const line = 1;
        let startOfLine;

        // STATES:
        const START_OF_LINE = 0;
        const INITIAL_LINE_WHITESPACE = 1;

        let state = START_OF_LINE;
        let currentLine = '';

        this.definitions['__LINE__'] = line;

        const length = this.rawCode.length;
        while (pos < length) {
            if (state === START_OF_LINE) {
                startOfLine = pos;
                state = INITIAL_LINE_WHITESPACE;
            }

            const ch = this.rawCode.charCodeAt(pos);
            if (ch === 92) { // backslash
                const ch2 = this.rawCode.charCodeAt(pos + 1);
                if (ch === 10) {
                    ++line;
                    this.definitions['__LINE__'] = line;
                    pos += 2;
                }
                else {

                }
            }

            switch (state) {
                case INITIAL_LINE_WHITESPACE:
                    switch (ch) {
                        case 7:
                        case 10:
                        case 32:
                            ++pos;
                            break;
                        case 35:    // #
                            state = AFTER_INITIAL_HASH;
                            ++pos;
                            break;
                    }
            }
        }

        return this.rawCode;
    }
}

export default Precompiler;

const Spec = [
    //whitespace
    [/^\s+/, null],

    //tags
    [/^\[[a-zA-Z0-9]+/, 'TAG_IDENTIFIER'],
    [/^\"[^"]*\"/, 'TAG_VALUE'],

    //moves
    [/^\d+\.(\.\.)?/, 'MOVE_NUMBER'],
    [/^[a-zA-Z]+[a-zA-Z1-8-\+#=]+/, 'MOVE_NOTATION'],

    //annotations
    [/^\$\d+/, 'ANNOTATION_GLYPH'],
    [/^\{[^{^}]*\}/, 'ANNOTATION'],

    //symbols, delimiters
    [/^\]/, ']'],
    [/^\(/, '('],
    [/^\)/, ')'],

    //game result
    [/^1-0|0-1|1\/2\-1\/2|\*/, "RESULT"],
];

class Tokenizer {

    init(string) {
        this._string = string;
        this._cursor = 0;
    }

    isEOF() {
        return this._cursor === this._string.length;
    }

    hasMoreTokens() {
        return this._cursor < this._string.length;
    }

    getNextToken() {
        if (!this.hasMoreTokens()) {
            return null
        }

        const string = this._string.slice(this._cursor);

        for (const [regex, tokenType] of Spec) {

            const tokenValue = this._match(regex, string);

            if (tokenValue == null) {
                continue;
            }

            if (tokenType == null) {
                return this.getNextToken();
            }

            return {
                type: tokenType,
                value: tokenValue
            };
        }

        throw new SyntaxError(`Unexpected token: "${string[0]}"`);
    }

    _match(regex, string) {
        const matched = regex.exec(string);
        if (matched == null) {
            return null;
        }
        this._cursor += matched[0].length;
        return matched[0]
    }
}

// module.exports = {
//     Tokenizer
// };
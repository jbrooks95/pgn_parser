//const { Tokenizer } = require("./tokenizer");

class PgnParser {

    constructor() {
        this._tokenizer = new Tokenizer();
    }

    parse(string) {
        this._string = string;
        this._tokenizer.init(string);

        this._lookahead = this._tokenizer.getNextToken();

        return this.PGN();
    }

    PGN() {
        return {
            type: 'PGN',
            body: this.GameList()
        };
    }

    GameList() {
        const gameList = [this.Game()];

        while (this._lookahead != null) {
            gameList.push(this.Game());
        }
        return gameList;
    }

    Game() {
        var tags = null
        if (this._lookahead.type === "TAG_IDENTIFIER") {
            tags = this.TagList();
        }
        const elements = this.ElementSequence();

        var result = null
        if (this._lookahead != null) {
            result = this.Result();
        }

        return {
            type: 'GAME',
            tags,
            elements,
            result
        }
    }

    ElementSequence(stopLookahead = null) {
        const elementSequence = [this.Element()];

        while (this._lookahead != null && this._lookahead.type !== stopLookahead && this._lookahead.type !== 'RESULT') {
            elementSequence.push(this.Element());
        }
        return elementSequence;
    }

    Element() {
        switch (this._lookahead.type) {
            case 'MOVE_NUMBER':
                return this.MoveNumber();
            case 'MOVE_NOTATION':
                return this.MoveNotation();
            case 'ANNOTATION_GLYPH':
                return this.AnnotationGlyph();
            case 'ANNOTATION':
                return this.Annotation();
            case '(':
                return this.RecursiveVariation();
        }
        this._lookahead = this._tokenizer.getNextToken();
        throw new SyntaxError(`Literal: unexpected literal production`);
    }

    RecursiveVariation() {
        this._eat('(');
        const elementSequence = this._lookahead.type !== ')' ? this.ElementSequence(')') : [];
        this._eat(')');
        return {
            type: 'RecursiveVariation',
            elementSequence
        }
    }

    MoveNumber() {
        const token = this._eat('MOVE_NUMBER');
        return {
            type: 'MoveNumber',
            value: token.value
        };
    }

    MoveNotation() {
        const token = this._eat('MOVE_NOTATION');
        return {
            type: 'MoveNotation',
            value: token.value
        };
    }

    AnnotationGlyph() {
        const token = this._eat('ANNOTATION_GLYPH');
        return {
            type: 'AnnotationGlyph',
            value: token.value
        };
    }

    Annotation() {
        const token = this._eat('ANNOTATION');
        return {
            type: 'Annotation',
            value: token.value.slice(1, -1)
        };
    }

    Result() {
        const token = this._eat('RESULT');
        return {
            type: 'Result',
            value: token.value
        };
    }

    TagList() {
        const TagList = [this.Tag()];

        while (this._lookahead != null && this._lookahead.type === 'TAG_IDENTIFIER') {
            TagList.push(this.Tag());
        }
        return TagList;
    }

    Tag() {
        const name = this.TagIdentifer();
        const value = this.TagValue();
        this._eat(']');
        return {
            type: 'Tag',
            name,
            value: value
        }
    }

    TagIdentifer() {
        const token = this._eat('TAG_IDENTIFIER');
        return {
            type: 'TagIdentifier',
            value: token.value.slice(1)
        };
    }

    TagValue() {
        const token = this._eat('TAG_VALUE');
        return {
            type: 'TagValue',
            value: token.value.slice(1, -1)
        };
    }

    _eat(tokenType) {
        const token = this._lookahead;
        if (token == null) {
            throw new SyntaxError(
                `Unexpected end of input, expected: "${tokenType}`
            );
        }

        if (token.type !== tokenType) {
            throw new SyntaxError(
                `Unexpected token: "${token.value}", expected: "${tokenType}"`
            );
        }

        this._lookahead = this._tokenizer.getNextToken();

        return token;
    }
}

// module.exports = {
//     PgnParser
// };
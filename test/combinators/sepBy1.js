/*
 * loquat-combinators test / combinators.sepBy1()
 */

"use strict";

const chai = require("chai");
const expect = chai.expect;

const SourcePos        = _core.SourcePos;
const ErrorMessageType = _core.ErrorMessageType;
const ErrorMessage     = _core.ErrorMessage;
const ParseError       = _core.ParseError;
const Config           = _core.Config;
const State            = _core.State;
const Result           = _core.Result;
const Parser           = _core.Parser;
const assertParser     = _core.assertParser;

const sepBy1 = _combinators.sepBy1;

describe(".sepBy1(parser, sep)", () => {
    it("should return a parser that parses one or more tokens accepted by `parser'"
        + " separated by token accepted by `sep', and concats the resultant values into an array", () => {
        const arrayEqual = (arrA, arrB) => arrA.length === arrB.length && arrA.every((elem, i) => elem === arrB[i]);

        const initState = new State(
            new Config({ tabWidth: 8 }),
            "input",
            new SourcePos("foobar", 1, 1),
            "none"
        );
        function generateParsers(consumed, success, vals, states, errs) {
            let i = 0;
            let j = 1;
            return [
                new Parser(state => {
                    expect(State.equal(state, i === 0 ? initState : states[j - 2])).to.be.true;
                    const _consumed = consumed[i];
                    const _success  = success[i];
                    const _val      = vals[i];
                    const _state    = states[i];
                    const _err      = errs[i];
                    i += 2;
                    return new Result(_consumed, _success, _err, _val, _state);
                }),
                new Parser(state => {
                    expect(State.equal(state, states[i - 2])).to.be.true;
                    const _consumed = consumed[j];
                    const _success  = success[j];
                    const _val      = vals[j];
                    const _state    = states[j];
                    const _err      = errs[j];
                    j += 2;
                    return new Result(_consumed, _success, _err, _val, _state);
                })
            ];
        }
        // csuc, csuc, csuc, cerr
        {
            const consumed = [true, true, true, true];
            const success = [true, true, true, false];
            const vals = ["nyan", undefined, "cat"];
            const states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 2),
                    "someA"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restB",
                    new SourcePos("foobar", 1, 3),
                    "someB"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restC",
                    new SourcePos("foobar", 1, 4),
                    "someC"
                )
            ];
            const errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testC")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 5),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testD")]
                )
            ];
            const parsers = generateParsers(consumed, success, vals, states, errs);
            const manyParser = sepBy1(parsers[0], parsers[1]);
            assertParser(manyParser);
            const res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 5),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testD")]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // csuc, csuc, csuc, eerr
        {
            const consumed = [true, true, true, false];
            const success = [true, true, true, false];
            const vals = ["nyan", undefined, "cat"];
            const states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 2),
                    "someA"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restB",
                    new SourcePos("foobar", 1, 3),
                    "someB"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restC",
                    new SourcePos("foobar", 1, 4),
                    "someC"
                )
            ];
            const errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testC")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testD")]
                )
            ];
            const parsers = generateParsers(consumed, success, vals, states, errs);
            const manyParser = sepBy1(parsers[0], parsers[1]);
            assertParser(manyParser);
            const res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 4),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testD")]
                    ),
                    ["nyan", "cat"],
                    new State(
                        new Config({ tabWidth: 8 }),
                        "restC",
                        new SourcePos("foobar", 1, 4),
                        "someC"
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // csuc, csuc, cerr
        {
            const consumed = [true, true, true];
            const success = [true, true, false];
            const vals = ["nyan", undefined];
            const states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 2),
                    "someA"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restB",
                    new SourcePos("foobar", 1, 3),
                    "someB"
                )
            ];
            const errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testC")]
                )
            ];
            const parsers = generateParsers(consumed, success, vals, states, errs);
            const manyParser = sepBy1(parsers[0], parsers[1]);
            assertParser(manyParser);
            const res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 4),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testC")]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // csuc, csuc, esuc, cerr
        {
            const consumed = [true, true, false, true];
            const success = [true, true, true, false];
            const vals = ["nyan", undefined, "cat"];
            const states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 2),
                    "someA"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restB",
                    new SourcePos("foobar", 1, 3),
                    "someB"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restC",
                    new SourcePos("foobar", 1, 3),
                    "someC"
                )
            ];
            const errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testC")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testD")]
                )
            ];
            const parsers = generateParsers(consumed, success, vals, states, errs);
            const manyParser = sepBy1(parsers[0], parsers[1]);
            assertParser(manyParser);
            const res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 4),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testD")]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // csuc, csuc, esuc, eerr
        {
            const consumed = [true, true, false, false];
            const success = [true, true, true, false];
            const vals = ["nyan", undefined, "cat"];
            const states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 2),
                    "someA"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restB",
                    new SourcePos("foobar", 1, 3),
                    "someB"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restC",
                    new SourcePos("foobar", 1, 3),
                    "someC"
                )
            ];
            const errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testC")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testD")]
                )
            ];
            const parsers = generateParsers(consumed, success, vals, states, errs);
            const manyParser = sepBy1(parsers[0], parsers[1]);
            assertParser(manyParser);
            const res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 3),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testD")]
                    ),
                    ["nyan", "cat"],
                    new State(
                        new Config({ tabWidth: 8 }),
                        "restC",
                        new SourcePos("foobar", 1, 3),
                        "someC"
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // csuc, csuc, eerr
        {
            const consumed = [true, true, false];
            const success = [true, true, false];
            const vals = ["nyan", undefined];
            const states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 2),
                    "someA"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restB",
                    new SourcePos("foobar", 1, 3),
                    "someB"
                )
            ];
            const errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testC")]
                )
            ];
            const parsers = generateParsers(consumed, success, vals, states, errs);
            const manyParser = sepBy1(parsers[0], parsers[1]);
            assertParser(manyParser);
            const res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 3),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testB"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testC")
                        ]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // csuc, cerr
        {
            const consumed = [true, true];
            const success = [true, false];
            const vals = ["nyan"];
            const states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 2),
                    "someA"
                )
            ];
            const errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                )
            ];
            const parsers = generateParsers(consumed, success, vals, states, errs);
            const manyParser = sepBy1(parsers[0], parsers[1]);
            assertParser(manyParser);
            const res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 3),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // csuc, esuc, csuc, cerr
        {
            const consumed = [true, false, true, true];
            const success = [true, true, true, false];
            const vals = ["nyan", undefined, "cat"];
            const states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 2),
                    "someA"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restB",
                    new SourcePos("foobar", 1, 2),
                    "someB"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restC",
                    new SourcePos("foobar", 1, 3),
                    "someC"
                )
            ];
            const errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testC")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testD")]
                )
            ];
            const parsers = generateParsers(consumed, success, vals, states, errs);
            const manyParser = sepBy1(parsers[0], parsers[1]);
            assertParser(manyParser);
            const res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 4),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testD")]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // csuc, esuc, csuc, eerr
        {
            const consumed = [true, false, true, false];
            const success = [true, true, true, false];
            const vals = ["nyan", undefined, "cat"];
            const states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 2),
                    "someA"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restB",
                    new SourcePos("foobar", 1, 2),
                    "someB"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restC",
                    new SourcePos("foobar", 1, 3),
                    "someC"
                )
            ];
            const errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testC")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testD")]
                )
            ];
            const parsers = generateParsers(consumed, success, vals, states, errs);
            const manyParser = sepBy1(parsers[0], parsers[1]);
            assertParser(manyParser);
            const res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 3),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testD")]
                    ),
                    ["nyan", "cat"],
                    new State(
                        new Config({ tabWidth: 8 }),
                        "restC",
                        new SourcePos("foobar", 1, 3),
                        "someC"
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // csuc, esuc, cerr
        {
            const consumed = [true, false, true];
            const success = [true, true, false];
            const vals = ["nyan", undefined];
            const states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 2),
                    "someA"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restB",
                    new SourcePos("foobar", 1, 2),
                    "someB"
                )
            ];
            const errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testC")]
                )
            ];
            const parsers = generateParsers(consumed, success, vals, states, errs);
            const manyParser = sepBy1(parsers[0], parsers[1]);
            assertParser(manyParser);
            const res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 3),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testC")]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // csuc, esuc, esuc, cerr -> error
        // csuc, esuc, esuc, eerr -> error
        // csuc, esuc, eerr
        {
            const consumed = [true, false, false];
            const success = [true, true, false];
            const vals = ["nyan", undefined];
            const states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 2),
                    "someA"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restB",
                    new SourcePos("foobar", 1, 2),
                    "someB"
                )
            ];
            const errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testC")]
                )
            ];
            const parsers = generateParsers(consumed, success, vals, states, errs);
            const manyParser = sepBy1(parsers[0], parsers[1]);
            assertParser(manyParser);
            const res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 2),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testA"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testB"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testC")
                        ]
                    ),
                    ["nyan"],
                    new State(
                        new Config({ tabWidth: 8 }),
                        "restA",
                        new SourcePos("foobar", 1, 2),
                        "someA"
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // csuc, eerr
        {
            const consumed = [true, false];
            const success = [true, false];
            const vals = ["nyan"];
            const states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 2),
                    "someA"
                )
            ];
            const errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                )
            ];
            const parsers = generateParsers(consumed, success, vals, states, errs);
            const manyParser = sepBy1(parsers[0], parsers[1]);
            assertParser(manyParser);
            const res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 2),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testA"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testB")
                        ]
                    ),
                    ["nyan"],
                    new State(
                        new Config({ tabWidth: 8 }),
                        "restA",
                        new SourcePos("foobar", 1, 2),
                        "someA"
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // cerr
        {
            const consumed = [true];
            const success = [false];
            const vals = [];
            const states = [];
            const errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                )
            ];
            const parsers = generateParsers(consumed, success, vals, states, errs);
            const manyParser = sepBy1(parsers[0], parsers[1]);
            assertParser(manyParser);
            const res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, csuc, csuc, cerr
        {
            const consumed = [false, true, true, true];
            const success = [true, true, true, false];
            const vals = ["nyan", undefined, "cat"];
            const states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 1),
                    "someA"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restB",
                    new SourcePos("foobar", 1, 2),
                    "someB"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restC",
                    new SourcePos("foobar", 1, 3),
                    "someC"
                )
            ];
            const errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testC")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testD")]
                )
            ];
            const parsers = generateParsers(consumed, success, vals, states, errs);
            const manyParser = sepBy1(parsers[0], parsers[1]);
            assertParser(manyParser);
            const res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 4),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testD")]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, csuc, csuc, eerr
        {
            const consumed = [false, true, true, false];
            const success = [true, true, true, false];
            const vals = ["nyan", undefined, "cat"];
            const states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 1),
                    "someA"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restB",
                    new SourcePos("foobar", 1, 2),
                    "someB"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restC",
                    new SourcePos("foobar", 1, 3),
                    "someC"
                )
            ];
            const errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testC")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testD")]
                )
            ];
            const parsers = generateParsers(consumed, success, vals, states, errs);
            const manyParser = sepBy1(parsers[0], parsers[1]);
            assertParser(manyParser);
            const res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 3),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testD")]
                    ),
                    ["nyan", "cat"],
                    new State(
                        new Config({ tabWidth: 8 }),
                        "restC",
                        new SourcePos("foobar", 1, 3),
                        "someC"
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, csuc, cerr
        {
            const consumed = [false, true, true];
            const success = [true, true, false];
            const vals = ["nyan", undefined];
            const states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 1),
                    "someA"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restB",
                    new SourcePos("foobar", 1, 2),
                    "someB"
                )
            ];
            const errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testC")]
                )
            ];
            const parsers = generateParsers(consumed, success, vals, states, errs);
            const manyParser = sepBy1(parsers[0], parsers[1]);
            assertParser(manyParser);
            const res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 3),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testC")]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, csuc, esuc, cerr
        {
            const consumed = [false, true, false, true];
            const success = [true, true, true, false];
            const vals = ["nyan", undefined, "cat"];
            const states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 1),
                    "someA"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restB",
                    new SourcePos("foobar", 1, 2),
                    "someB"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restC",
                    new SourcePos("foobar", 1, 2),
                    "someC"
                )
            ];
            const errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testC")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testD")]
                )
            ];
            const parsers = generateParsers(consumed, success, vals, states, errs);
            const manyParser = sepBy1(parsers[0], parsers[1]);
            assertParser(manyParser);
            const res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 3),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testD")]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, csuc, esuc, eerr
        {
            const consumed = [false, true, false, false];
            const success = [true, true, true, false];
            const vals = ["nyan", undefined, "cat"];
            const states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 1),
                    "someA"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restB",
                    new SourcePos("foobar", 1, 2),
                    "someB"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restC",
                    new SourcePos("foobar", 1, 2),
                    "someC"
                )
            ];
            const errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testC")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testD")]
                )
            ];
            const parsers = generateParsers(consumed, success, vals, states, errs);
            const manyParser = sepBy1(parsers[0], parsers[1]);
            assertParser(manyParser);
            const res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testD")]
                    ),
                    ["nyan", "cat"],
                    new State(
                        new Config({ tabWidth: 8 }),
                        "restC",
                        new SourcePos("foobar", 1, 2),
                        "someC"
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, csuc, eerr
        {
            const consumed = [false, true, false];
            const success = [true, true, false];
            const vals = ["nyan", undefined];
            const states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 1),
                    "someA"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restB",
                    new SourcePos("foobar", 1, 2),
                    "someB"
                )
            ];
            const errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testC")]
                )
            ];
            const parsers = generateParsers(consumed, success, vals, states, errs);
            const manyParser = sepBy1(parsers[0], parsers[1]);
            assertParser(manyParser);
            const res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 2),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testB"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testC")
                        ]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, cerr
        {
            const consumed = [false, true];
            const success = [true, false];
            const vals = ["nyan"];
            const states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 1),
                    "someA"
                )
            ];
            const errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                )
            ];
            const parsers = generateParsers(consumed, success, vals, states, errs);
            const manyParser = sepBy1(parsers[0], parsers[1]);
            assertParser(manyParser);
            const res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, esuc, csuc, cerr
        {
            const consumed = [false, false, true, true];
            const success = [true, true, true, false];
            const vals = ["nyan", undefined, "cat"];
            const states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 1),
                    "someA"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restB",
                    new SourcePos("foobar", 1, 1),
                    "someB"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restC",
                    new SourcePos("foobar", 1, 2),
                    "someC"
                )
            ];
            const errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testC")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testD")]
                )
            ];
            const parsers = generateParsers(consumed, success, vals, states, errs);
            const manyParser = sepBy1(parsers[0], parsers[1]);
            assertParser(manyParser);
            const res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 3),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testD")]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, esuc, csuc, eerr
        {
            const consumed = [false, false, true, false];
            const success = [true, true, true, false];
            const vals = ["nyan", undefined, "cat"];
            const states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 1),
                    "someA"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restB",
                    new SourcePos("foobar", 1, 1),
                    "someB"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restC",
                    new SourcePos("foobar", 1, 2),
                    "someC"
                )
            ];
            const errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testC")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testD")]
                )
            ];
            const parsers = generateParsers(consumed, success, vals, states, errs);
            const manyParser = sepBy1(parsers[0], parsers[1]);
            assertParser(manyParser);
            const res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testD")]
                    ),
                    ["nyan", "cat"],
                    new State(
                        new Config({ tabWidth: 8 }),
                        "restC",
                        new SourcePos("foobar", 1, 2),
                        "someC"
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, esuc, cerr
        {
            const consumed = [false, false, true];
            const success = [true, true, false];
            const vals = ["nyan", undefined];
            const states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 1),
                    "someA"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restB",
                    new SourcePos("foobar", 1, 1),
                    "someB"
                )
            ];
            const errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testC")]
                )
            ];
            const parsers = generateParsers(consumed, success, vals, states, errs);
            const manyParser = sepBy1(parsers[0], parsers[1]);
            assertParser(manyParser);
            const res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testC")]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, esuc, esuc, cerr -> error
        // esuc, esuc, esuc, eerr -> error
        // esuc, esuc, eerr
        {
            const consumed = [false, false, false];
            const success = [true, true, false];
            const vals = ["nyan", undefined];
            const states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 1),
                    "someA"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restB",
                    new SourcePos("foobar", 1, 1),
                    "someB"
                )
            ];
            const errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testC")]
                )
            ];
            const parsers = generateParsers(consumed, success, vals, states, errs);
            const manyParser = sepBy1(parsers[0], parsers[1]);
            assertParser(manyParser);
            const res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.esuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 1),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testA"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testB"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testC")
                        ]
                    ),
                    ["nyan"],
                    new State(
                        new Config({ tabWidth: 8 }),
                        "restA",
                        new SourcePos("foobar", 1, 1),
                        "someA"
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, eerr
        {
            const consumed = [false, false];
            const success = [true, false];
            const vals = ["nyan"];
            const states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 1),
                    "someA"
                )
            ];
            const errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                )
            ];
            const parsers = generateParsers(consumed, success, vals, states, errs);
            const manyParser = sepBy1(parsers[0], parsers[1]);
            assertParser(manyParser);
            const res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.esuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 1),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testA"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testB")
                        ]
                    ),
                    ["nyan"],
                    new State(
                        new Config({ tabWidth: 8 }),
                        "restA",
                        new SourcePos("foobar", 1, 1),
                        "someA"
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // eerr
        {
            const consumed = [false];
            const success = [false];
            const vals = [];
            const states = [];
            const errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                )
            ];
            const parsers = generateParsers(consumed, success, vals, states, errs);
            const manyParser = sepBy1(parsers[0], parsers[1]);
            assertParser(manyParser);
            const res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.eerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 1),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
    });

    it("should throw an `Error' if both separator and parser succeed without consuming input", () => {
        const initState = new State(
            new Config({ tabWidth: 8 }),
            "input",
            new SourcePos("foobar", 1, 1),
            "none"
        );
        function generateParsers(consumed, success, vals, states, errs) {
            let i = 0;
            let j = 1;
            return [
                new Parser(state => {
                    expect(State.equal(state, i === 0 ? initState : states[j - 2])).to.be.true;
                    const _consumed = consumed[i];
                    const _success  = success[i];
                    const _val      = vals[i];
                    const _state    = states[i];
                    const _err      = errs[i];
                    i += 2;
                    return new Result(_consumed, _success, _err, _val, _state);
                }),
                new Parser(state => {
                    expect(State.equal(state, states[i - 2])).to.be.true;
                    const _consumed = consumed[j];
                    const _success  = success[j];
                    const _val      = vals[j];
                    const _state    = states[j];
                    const _err      = errs[j];
                    j += 2;
                    return new Result(_consumed, _success, _err, _val, _state);
                })
            ];
        }
        // csuc, esuc, esuc, cerr
        {
            const consumed = [true, false, false, true];
            const success = [true, true, true, false];
            const vals = ["nyan", undefined, "cat"];
            const states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 2),
                    "someA"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restB",
                    new SourcePos("foobar", 1, 2),
                    "someB"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restC",
                    new SourcePos("foobar", 1, 2),
                    "someC"
                )
            ];
            const errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testC")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testD")]
                )
            ];
            const parsers = generateParsers(consumed, success, vals, states, errs);
            const manyParser = sepBy1(parsers[0], parsers[1]);
            assertParser(manyParser);
            expect(() => { manyParser.run(initState); }).to.throw(Error, /many/);
        }
        // csuc, esuc, esuc, eerr
        {
            const consumed = [true, false, false, false];
            const success = [true, true, true, false];
            const vals = ["nyan", undefined, "cat"];
            const states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 2),
                    "someA"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restB",
                    new SourcePos("foobar", 1, 2),
                    "someB"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restC",
                    new SourcePos("foobar", 1, 2),
                    "someC"
                )
            ];
            const errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testC")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testD")]
                )
            ];
            const parsers = generateParsers(consumed, success, vals, states, errs);
            const manyParser = sepBy1(parsers[0], parsers[1]);
            assertParser(manyParser);
            expect(() => { manyParser.run(initState); }).to.throw(Error, /many/);
        }
        // esuc, esuc, esuc, cerr
        {
            const consumed = [false, false, false, true];
            const success = [true, true, true, false];
            const vals = ["nyan", undefined, "cat"];
            const states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 1),
                    "someA"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restB",
                    new SourcePos("foobar", 1, 1),
                    "someB"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restC",
                    new SourcePos("foobar", 1, 1),
                    "someC"
                )
            ];
            const errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testC")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testD")]
                )
            ];
            const parsers = generateParsers(consumed, success, vals, states, errs);
            const manyParser = sepBy1(parsers[0], parsers[1]);
            assertParser(manyParser);
            expect(() => { manyParser.run(initState); }).to.throw(Error, /many/);
        }
        // esuc, esuc, esuc, eerr
        {
            const consumed = [false, false, false, false];
            const success = [true, true, true, false];
            const vals = ["nyan", undefined, "cat"];
            const states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 1),
                    "someA"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restB",
                    new SourcePos("foobar", 1, 1),
                    "someB"
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restC",
                    new SourcePos("foobar", 1, 1),
                    "someC"
                )
            ];
            const errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testC")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testD")]
                )
            ];
            const parsers = generateParsers(consumed, success, vals, states, errs);
            const manyParser = sepBy1(parsers[0], parsers[1]);
            assertParser(manyParser);
            expect(() => { manyParser.run(initState); }).to.throw(Error, /many/);
        }
    });
});

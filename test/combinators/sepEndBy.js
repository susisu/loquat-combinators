/*
 * loquat-combinators test / combinators.sepEndBy()
 * copyright (c) 2016 Susisu
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

const sepEndBy = _combinators.sepEndBy;

describe(".sepEndBy(parser, sep)", () => {
    it("should return a parser that parses zero or more tokens accepted by `parser'"
        + " separated or ended by token accepted by `sep', and concats the resultant values into an array", () => {
        let arrayEqual = (arrA, arrB) => arrA.length === arrB.length && arrA.every((elem, i) => elem === arrB[i]);

        let initState = new State(
            new Config({ tabWidth: 8 }),
            "input",
            new SourcePos("foobar", 1, 1),
            "none"
        );
        function generateParsers(consumed, succeeded, vals, states, errs) {
            let i = 0;
            let j = 1;
            return [
                new Parser(state => {
                    expect(State.equal(state, i === 0 ? initState : states[j - 2])).to.be.true;
                    let _consumed  = consumed[i];
                    let _succeeded = succeeded[i];
                    let _val       = vals[i];
                    let _state     = states[i];
                    let _err       = errs[i];
                    i += 2;
                    return new Result(_consumed, _succeeded, _err, _val, _state);
                }),
                new Parser(state => {
                    expect(State.equal(state, states[i - 2])).to.be.true;
                    let _consumed  = consumed[j];
                    let _succeeded = succeeded[j];
                    let _val       = vals[j];
                    let _state     = states[j];
                    let _err       = errs[j];
                    j += 2;
                    return new Result(_consumed, _succeeded, _err, _val, _state);
                })
            ];
        }
        // csuc, csuc, csuc, csuc, cerr
        {
            let consumed = [true, true, true, true, true];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 5),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 6),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 6),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // csuc, csuc, csuc, csuc, eerr
        {
            let consumed = [true, true, true, true, false];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 5),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 5),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 5),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testD"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testE")
                        ]
                    ),
                    ["nyan", "cat"],
                    new State(
                        new Config({ tabWidth: 8 }),
                        "restD",
                        new SourcePos("foobar", 1, 5),
                        "someD"
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // csuc, csuc, csuc, cerr
        {
            let consumed = [true, true, true, true];
            let succeeded = [true, true, true, false];
            let vals = ["nyan", undefined, "cat"];
            let states = [
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
            let errs = [
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
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
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
        // csuc, csuc, csuc, esuc, cerr
        {
            let consumed = [true, true, true, false, true];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 4),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 5),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 5),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // csuc, csuc, csuc, esuc, eerr
        {
            let consumed = [true, true, true, false, false];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 4),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 4),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testC"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testD"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testE")
                        ]
                    ),
                    ["nyan", "cat"],
                    new State(
                        new Config({ tabWidth: 8 }),
                        "restD",
                        new SourcePos("foobar", 1, 4),
                        "someD"
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // csuc, csuc, csuc, eerr
        {
            let consumed = [true, true, true, false];
            let succeeded = [true, true, true, false];
            let vals = ["nyan", undefined, "cat"];
            let states = [
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
            let errs = [
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
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 4),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testC"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testD")
                        ]
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
            let consumed = [true, true, true];
            let succeeded = [true, true, false];
            let vals = ["nyan", undefined];
            let states = [
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
            let errs = [
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
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
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
        // csuc, csuc, esuc, csuc, cerr
        {
            let consumed = [true, true, false, true, true];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 4),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 5),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 5),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // csuc, csuc, esuc, csuc, eerr
        {
            let consumed = [true, true, false, true, false];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 4),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 4),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testD"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testE")
                        ]
                    ),
                    ["nyan", "cat"],
                    new State(
                        new Config({ tabWidth: 8 }),
                        "restD",
                        new SourcePos("foobar", 1, 4),
                        "someD"
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // csuc, csuc, esuc, cerr
        {
            let consumed = [true, true, false, true];
            let succeeded = [true, true, true, false];
            let vals = ["nyan", undefined, "cat"];
            let states = [
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
            let errs = [
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
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
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
        // csuc, csuc, esuc, esuc, cerr
        {
            let consumed = [true, true, false, false, true];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 3),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 4),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // csuc, csuc, esuc, esuc, eerr
        {
            let consumed = [true, true, false, false, false];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 3),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 3),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testB"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testC"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testD"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testE")
                        ]
                    ),
                    ["nyan", "cat"],
                    new State(
                        new Config({ tabWidth: 8 }),
                        "restD",
                        new SourcePos("foobar", 1, 3),
                        "someD"
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // csuc, csuc, esuc, eerr
        {
            let consumed = [true, true, false, false];
            let succeeded = [true, true, true, false];
            let vals = ["nyan", undefined, "cat"];
            let states = [
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
            let errs = [
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
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 3),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testB"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testC"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testD")
                        ]
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
            let consumed = [true, true, false];
            let succeeded = [true, true, false];
            let vals = ["nyan", undefined];
            let states = [
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
            let errs = [
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
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 3),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testB"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testC")
                        ]
                    ),
                    ["nyan"],
                    new State(
                        new Config({ tabWidth: 8 }),
                        "restB",
                        new SourcePos("foobar", 1, 3),
                        "someB"
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // csuc, cerr
        {
            let consumed = [true, true];
            let succeeded = [true, false];
            let vals = ["nyan"];
            let states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 2),
                    "someA"
                )
            ];
            let errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
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
        // csuc, esuc, csuc, csuc, cerr
        {
            let consumed = [true, false, true, true, true];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 4),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 5),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 5),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // csuc, esuc, csuc, csuc, eerr
        {
            let consumed = [true, false, true, true, false];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 4),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 4),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testD"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testE")
                        ]
                    ),
                    ["nyan", "cat"],
                    new State(
                        new Config({ tabWidth: 8 }),
                        "restD",
                        new SourcePos("foobar", 1, 4),
                        "someD"
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // csuc, esuc, csuc, cerr
        {
            let consumed = [true, false, true, true];
            let succeeded = [true, true, true, false];
            let vals = ["nyan", undefined, "cat"];
            let states = [
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
            let errs = [
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
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
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
        // csuc, esuc, csuc, esuc, cerr
        {
            let consumed = [true, false, true, false, true];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 3),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 4),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // csuc, esuc, csuc, esuc, eerr
        {
            let consumed = [true, false, true, false, false];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 3),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 3),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testC"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testD"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testE")
                        ]
                    ),
                    ["nyan", "cat"],
                    new State(
                        new Config({ tabWidth: 8 }),
                        "restD",
                        new SourcePos("foobar", 1, 3),
                        "someD"
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // csuc, esuc, csuc, eerr
        {
            let consumed = [true, false, true, false];
            let succeeded = [true, true, true, false];
            let vals = ["nyan", undefined, "cat"];
            let states = [
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
            let errs = [
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
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 3),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testC"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testD")
                        ]
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
            let consumed = [true, false, true];
            let succeeded = [true, true, false];
            let vals = ["nyan", undefined];
            let states = [
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
            let errs = [
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
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
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
        // csuc, esuc, esuc, csuc, cerr
        {
            let consumed = [true, false, false, true, true];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 3),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 4),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // csuc, esuc, esuc, csuc, eerr
        {
            let consumed = [true, false, false, true, false];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 3),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 3),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testD"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testE")
                        ]
                    ),
                    ["nyan", "cat"],
                    new State(
                        new Config({ tabWidth: 8 }),
                        "restD",
                        new SourcePos("foobar", 1, 3),
                        "someD"
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // csuc, esuc, esuc, cerr
        {
            let consumed = [true, false, false, true];
            let succeeded = [true, true, true, false];
            let vals = ["nyan", undefined, "cat"];
            let states = [
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
            let errs = [
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
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
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
        // csuc, esuc, esuc, esuc, cerr
        {
            let consumed = [true, false, false, false, true];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 2),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 3),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // csuc, esuc, esuc, esuc, eerr
        {
            let consumed = [true, false, false, false, false];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 2),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 2),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testA"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testB"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testC"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testD"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testE")
                        ]
                    ),
                    ["nyan", "cat"],
                    new State(
                        new Config({ tabWidth: 8 }),
                        "restD",
                        new SourcePos("foobar", 1, 2),
                        "someD"
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // csuc, esuc, esuc, eerr
        {
            let consumed = [true, false, false, false];
            let succeeded = [true, true, true, false];
            let vals = ["nyan", undefined, "cat"];
            let states = [
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
            let errs = [
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
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 2),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testA"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testB"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testC"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testD")
                        ]
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
        // csuc, esuc, eerr
        {
            let consumed = [true, false, false];
            let succeeded = [true, true, false];
            let vals = ["nyan", undefined];
            let states = [
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
            let errs = [
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
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
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
                        "restB",
                        new SourcePos("foobar", 1, 2),
                        "someB"
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // csuc, eerr
        {
            let consumed = [true, false];
            let succeeded = [true, false];
            let vals = ["nyan"];
            let states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 2),
                    "someA"
                )
            ];
            let errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
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
            let consumed = [true];
            let succeeded = [false];
            let vals = [];
            let states = [];
            let errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
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
        // esuc, csuc, csuc, csuc, cerr
        {
            let consumed = [false, true, true, true, true];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 4),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 5),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 5),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, csuc, csuc, csuc, eerr
        {
            let consumed = [false, true, true, true, false];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 4),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 4),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testD"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testE")
                        ]
                    ),
                    ["nyan", "cat"],
                    new State(
                        new Config({ tabWidth: 8 }),
                        "restD",
                        new SourcePos("foobar", 1, 4),
                        "someD"
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, csuc, csuc, cerr
        {
            let consumed = [false, true, true, true];
            let succeeded = [true, true, true, false];
            let vals = ["nyan", undefined, "cat"];
            let states = [
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
            let errs = [
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
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
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
        // esuc, csuc, csuc, esuc, cerr
        {
            let consumed = [false, true, true, false, true];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 3),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 4),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, csuc, csuc, esuc, eerr
        {
            let consumed = [false, true, true, false, false];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 3),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 3),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testC"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testD"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testE")
                        ]
                    ),
                    ["nyan", "cat"],
                    new State(
                        new Config({ tabWidth: 8 }),
                        "restD",
                        new SourcePos("foobar", 1, 3),
                        "someD"
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, csuc, csuc, eerr
        {
            let consumed = [false, true, true, false];
            let succeeded = [true, true, true, false];
            let vals = ["nyan", undefined, "cat"];
            let states = [
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
            let errs = [
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
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 3),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testC"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testD")
                        ]
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
            let consumed = [false, true, true];
            let succeeded = [true, true, false];
            let vals = ["nyan", undefined];
            let states = [
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
            let errs = [
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
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
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
        // esuc, csuc, esuc, csuc, cerr
        {
            let consumed = [false, true, false, true, true];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 3),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 4),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, csuc, esuc, csuc, eerr
        {
            let consumed = [false, true, false, true, false];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 3),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 3),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testD"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testE")
                        ]
                    ),
                    ["nyan", "cat"],
                    new State(
                        new Config({ tabWidth: 8 }),
                        "restD",
                        new SourcePos("foobar", 1, 3),
                        "someD"
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, csuc, esuc, cerr
        {
            let consumed = [false, true, false, true];
            let succeeded = [true, true, true, false];
            let vals = ["nyan", undefined, "cat"];
            let states = [
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
            let errs = [
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
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
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
        // esuc, csuc, esuc, esuc, cerr
        {
            let consumed = [false, true, false, false, true];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 2),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 3),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, csuc, esuc, esuc, eerr
        {
            let consumed = [false, true, false, false, false];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 2),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 2),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testB"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testC"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testD"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testE")
                        ]
                    ),
                    ["nyan", "cat"],
                    new State(
                        new Config({ tabWidth: 8 }),
                        "restD",
                        new SourcePos("foobar", 1, 2),
                        "someD"
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, csuc, esuc, eerr
        {
            let consumed = [false, true, false, false];
            let succeeded = [true, true, true, false];
            let vals = ["nyan", undefined, "cat"];
            let states = [
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
            let errs = [
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
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 2),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testB"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testC"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testD")
                        ]
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
            let consumed = [false, true, false];
            let succeeded = [true, true, false];
            let vals = ["nyan", undefined];
            let states = [
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
            let errs = [
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
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 2),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testB"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testC")
                        ]
                    ),
                    ["nyan"],
                    new State(
                        new Config({ tabWidth: 8 }),
                        "restB",
                        new SourcePos("foobar", 1, 2),
                        "someB"
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, cerr
        {
            let consumed = [false, true];
            let succeeded = [true, false];
            let vals = ["nyan"];
            let states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 1),
                    "someA"
                )
            ];
            let errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
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
        // esuc, esuc, csuc, csuc, cerr
        {
            let consumed = [false, false, true, true, true];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 3),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 4),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 4),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, esuc, csuc, csuc, eerr
        {
            let consumed = [false, false, true, true, false];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 3),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 3),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testD"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testE")
                        ]
                    ),
                    ["nyan", "cat"],
                    new State(
                        new Config({ tabWidth: 8 }),
                        "restD",
                        new SourcePos("foobar", 1, 3),
                        "someD"
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, esuc, csuc, cerr
        {
            let consumed = [false, false, true, true];
            let succeeded = [true, true, true, false];
            let vals = ["nyan", undefined, "cat"];
            let states = [
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
            let errs = [
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
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
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
        // esuc, esuc, csuc, esuc, cerr
        {
            let consumed = [false, false, true, false, true];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 2),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 3),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, esuc, csuc, esuc, eerr
        {
            let consumed = [false, false, true, false, false];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 2),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 2),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testC"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testD"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testE")
                        ]
                    ),
                    ["nyan", "cat"],
                    new State(
                        new Config({ tabWidth: 8 }),
                        "restD",
                        new SourcePos("foobar", 1, 2),
                        "someD"
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, esuc, csuc, eerr
        {
            let consumed = [false, false, true, false];
            let succeeded = [true, true, true, false];
            let vals = ["nyan", undefined, "cat"];
            let states = [
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
            let errs = [
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
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 2),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testC"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testD")
                        ]
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
            let consumed = [false, false, true];
            let succeeded = [true, true, false];
            let vals = ["nyan", undefined];
            let states = [
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
            let errs = [
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
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
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
        // esuc, esuc, esuc, csuc, cerr
        {
            let consumed = [false, false, false, true, true];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 2),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 3),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 3),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, esuc, esuc, csuc, eerr
        {
            let consumed = [false, false, false, true, false];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 2),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 2),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.csuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 2),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testD"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testE")
                        ]
                    ),
                    ["nyan", "cat"],
                    new State(
                        new Config({ tabWidth: 8 }),
                        "restD",
                        new SourcePos("foobar", 1, 2),
                        "someD"
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, esuc, esuc, cerr
        {
            let consumed = [false, false, false, true];
            let succeeded = [true, true, true, false];
            let vals = ["nyan", undefined, "cat"];
            let states = [
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
            let errs = [
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
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 2),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testD")]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, esuc, esuc, esuc, cerr
        {
            let consumed = [false, false, false, false, true];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 1),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.cerr(
                    new ParseError(
                        new SourcePos("foobar", 1, 1),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, esuc, esuc, esuc, eerr
        {
            let consumed = [false, false, false, false, false];
            let succeeded = [true, true, true, true, false];
            let vals = ["nyan", undefined, "cat", undefined];
            let states = [
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
                ),
                new State(
                    new Config({ tabWidth: 8 }),
                    "restD",
                    new SourcePos("foobar", 1, 1),
                    "someD"
                )
            ];
            let errs = [
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
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testE")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.esuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 1),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testA"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testB"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testC"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testD"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testE")
                        ]
                    ),
                    ["nyan", "cat"],
                    new State(
                        new Config({ tabWidth: 8 }),
                        "restD",
                        new SourcePos("foobar", 1, 1),
                        "someD"
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, esuc, esuc, eerr
        {
            let consumed = [false, false, false, false];
            let succeeded = [true, true, true, false];
            let vals = ["nyan", undefined, "cat"];
            let states = [
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
            let errs = [
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
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.esuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 1),
                        [
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testA"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testB"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testC"),
                            new ErrorMessage(ErrorMessageType.MESSAGE, "testD")
                        ]
                    ),
                    ["nyan", "cat"],
                    new State(
                        new Config({ tabWidth: 8 }),
                        "restC",
                        new SourcePos("foobar", 1, 1),
                        "someC"
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, esuc, eerr
        {
            let consumed = [false, false, false];
            let succeeded = [true, true, false];
            let vals = ["nyan", undefined];
            let states = [
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
            let errs = [
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
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
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
                        "restB",
                        new SourcePos("foobar", 1, 1),
                        "someB"
                    )
                ),
                arrayEqual
            )).to.be.true;
        }
        // esuc, eerr
        {
            let consumed = [false, false];
            let succeeded = [true, false];
            let vals = ["nyan"];
            let states = [
                new State(
                    new Config({ tabWidth: 8 }),
                    "restA",
                    new SourcePos("foobar", 1, 1),
                    "someA"
                )
            ];
            let errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                ),
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testB")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
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
            let consumed = [false];
            let succeeded = [false];
            let vals = [];
            let states = [];
            let errs = [
                new ParseError(
                    new SourcePos("foobar", 1, 1),
                    [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                )
            ];
            let parsers = generateParsers(consumed, succeeded, vals, states, errs);
            let manyParser = sepEndBy(parsers[0], parsers[1]);
            assertParser(manyParser);
            let res = manyParser.run(initState);
            expect(Result.equal(
                res,
                Result.esuc(
                    new ParseError(
                        new SourcePos("foobar", 1, 1),
                        [new ErrorMessage(ErrorMessageType.MESSAGE, "testA")]
                    ),
                    [],
                    initState
                ),
                arrayEqual
            )).to.be.true;
        }
    });
});

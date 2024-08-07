import { Lexer, createToken, CstParser, CstNode, ParserMethod, IToken, Rule } from "chevrotain"
import { generateCstDts } from 'chevrotain'
import * as Cst from './nccst';
import * as Shapes from '@src/renderer/shapes'
import * as Symbols from '@src/renderer/symbols'

import { Units, AttributeCollection, Binary } from '@src/renderer/types'
import { Format, ZeroSuppression, Position, ArcPosition, Point, InterpolateModeType, Mode, ArcDirection, CoordinateMode, CutterCompensation, PossiblePoints } from './types';
import * as Constants from './constants';


const DefaultTokens = {
  WhiteSpace: createToken({ name: "WhiteSpace", pattern: /\s+/, group: Lexer.SKIPPED }),
  NewLine: createToken({ name: "NewLine", pattern: /\r?\n/, line_breaks: true }),
  Number: createToken({ name: "Number", pattern: /[+-]?(?:\d+\.?(?:\d+)?|\.\d+)/ }),
  Units: createToken({ name: "Units", pattern: /METRIC|INCH/ }),
  TrailingZeros: createToken({ name: "TrailingZeros", pattern: /TZ/ }),
  LeadingZeros: createToken({ name: "LeadingZeros", pattern: /LZ/ }),
  IncrementalMode: createToken({ name: "IncrementalMode", pattern: /ICI/ }),
  On: createToken({ name: "On", pattern: /ON/ }),
  Off: createToken({ name: "Off", pattern: /OFF/ }),
  CP: createToken({ name: "CP", pattern: /CP/ }),
  T: createToken({ name: "T", pattern: /T\d{1,2}(?:\d{1,2})?/ }),
  // Tool Parameters
  F: createToken({ name: "F", pattern: /F/ }),
  S: createToken({ name: "S", pattern: /S/ }),
  C: createToken({ name: "C", pattern: /C/ }),
  B: createToken({ name: "B", pattern: /B/ }),
  H: createToken({ name: "H", pattern: /H/ }),
  Z: createToken({ name: "Z", pattern: /Z/ }),
  // Coordinate System
  X: createToken({ name: "X", pattern: /X/ }),
  Y: createToken({ name: "Y", pattern: /Y/ }),
  A: createToken({ name: "A", pattern: /A/ }),
  I: createToken({ name: "I", pattern: /I/ }),
  J: createToken({ name: "J", pattern: /J/ }),
  // M Codes
  M00: createToken({ name: "M00", pattern: /M00/ }),
  M01: createToken({ name: "M01", pattern: /M01/ }),
  M02: createToken({ name: "M02", pattern: /M02/ }),
  M06: createToken({ name: "M06", pattern: /M06/ }),
  M08: createToken({ name: "M06", pattern: /M08/ }),
  M09: createToken({ name: "M09", pattern: /M09/ }),
  M14: createToken({ name: "M14", pattern: /M14/ }),
  M15: createToken({ name: "M15", pattern: /M15/ }),
  M16: createToken({ name: "M16", pattern: /M16/ }),
  M17: createToken({ name: "M17", pattern: /M17/ }),
  M25: createToken({ name: "M25", pattern: /M25/ }),
  M30: createToken({ name: "M30", pattern: /M30/ }),
  M45: createToken({ name: "M45", pattern: /M45/, push_mode: "TextMode" }),
  M47: createToken({ name: "M47", pattern: /M47/, push_mode: "TextMode" }),
  M48: createToken({ name: "M48", pattern: /M48/ }),
  M70: createToken({ name: "M70", pattern: /M70/ }),
  M71: createToken({ name: "M71", pattern: /M71/ }),
  M72: createToken({ name: "M72", pattern: /M72/ }),
  M80: createToken({ name: "M80", pattern: /M80/ }),
  M90: createToken({ name: "M90", pattern: /M90/ }),
  // G Codes
  G00: createToken({ name: "G00", pattern: /G00/ }),
  G01: createToken({ name: "G01", pattern: /G01/ }),
  G02: createToken({ name: "G02", pattern: /G02/ }),
  G03: createToken({ name: "G03", pattern: /G03/ }),
  G04: createToken({ name: "G04", pattern: /G04/ }),
  G05: createToken({ name: "G05", pattern: /G05/ }),
  G32: createToken({ name: "G32", pattern: /G32/ }),
  G33: createToken({ name: "G33", pattern: /G33/ }),
  G40: createToken({ name: "G40", pattern: /G40/ }),
  G41: createToken({ name: "G41", pattern: /G41/ }),
  G42: createToken({ name: "G42", pattern: /G42/ }),
  G90: createToken({ name: "G90", pattern: /G90/ }),
  G91: createToken({ name: "G91", pattern: /G91/ }),
  G93: createToken({ name: "G93", pattern: /G93/ }),
  // Other
  Percent: createToken({ name: "Percent", pattern: /%/ }),
  Comma: createToken({ name: "Comma", pattern: /,/ }),
  LParen: createToken({ name: "LParen", pattern: /\(/, push_mode: "CommentMode" }),
  RParen: createToken({ name: "RParen", pattern: /\)/ }),
  // Attribute: createToken({ name: "Attribute", pattern: /#@!/ }),
  Semicolon: createToken({ name: "Semicolon", pattern: /;/, push_mode: "CommentMode" }),
  // Unknown: createToken({ name: "Unknown", pattern: /./ }),
} as const

const CommentTokens = {
  NewLine: createToken({ name: "NewLine", pattern: /\r?\n/, line_breaks: true, pop_mode: true }),
  RParen: createToken({ name: "RParen", pattern: /\)/, pop_mode: true }),
  Attribute: createToken({ name: "Attribute", pattern: /\s*#@!/ }),
  Text: createToken({ name: "Text", pattern: /[^\r\n)]+/ }),
}

const TextTokens = {
  Text: createToken({ name: "Text", pattern: /[^\r\n]+/ }),
  EndText: createToken({ name: "EndText", pattern: /\r?\n/, pop_mode: true, line_breaks: true }),
}


const multiModeLexerDefinition = {
  modes: {
    DefaultMode: Object.values(DefaultTokens),
    CommentMode: Object.values(CommentTokens),
    TextMode: Object.values(TextTokens),
  },

  defaultMode: "DefaultMode",
};

export const SelectLexer = new Lexer(multiModeLexerDefinition)

class NCParser extends CstParser {
  command!: ParserMethod<unknown[], CstNode>
  units!: ParserMethod<unknown[], CstNode>
  incrementalModeSwitch!: ParserMethod<unknown[], CstNode>
  compensationIndex!: ParserMethod<unknown[], CstNode>
  toolDefinition!: ParserMethod<unknown[], CstNode>
  toolChange!: ParserMethod<unknown[], CstNode>
  comment!: ParserMethod<unknown[], CstNode>
  move!: ParserMethod<unknown[], CstNode>
  toolDia!: ParserMethod<unknown[], CstNode>
  feed!: ParserMethod<unknown[], CstNode>
  speed!: ParserMethod<unknown[], CstNode>
  retractRate!: ParserMethod<unknown[], CstNode>
  hitCount!: ParserMethod<unknown[], CstNode>
  depthOffset!: ParserMethod<unknown[], CstNode>
  xy!: ParserMethod<unknown[], CstNode>
  xory!: ParserMethod<unknown[], CstNode>
  x!: ParserMethod<unknown[], CstNode>
  y!: ParserMethod<unknown[], CstNode>
  coordinate!: ParserMethod<unknown[], CstNode>
  arcRadius!: ParserMethod<unknown[], CstNode>
  arcCenter!: ParserMethod<unknown[], CstNode>
  endOfProgramNoRewind!: ParserMethod<unknown[], CstNode>
  beginPattern!: ParserMethod<unknown[], CstNode>
  endOfPattern!: ParserMethod<unknown[], CstNode>
  repeatPatternOffset!: ParserMethod<unknown[], CstNode>
  optionalStop!: ParserMethod<unknown[], CstNode>
  endOfStepAndRepeat!: ParserMethod<unknown[], CstNode>
  stopForInspect!: ParserMethod<unknown[], CstNode>
  zAxisRoutPositionWithDepthControlledCountoring!: ParserMethod<unknown[], CstNode>
  zAxisRoutPosition!: ParserMethod<unknown[], CstNode>
  retractWithClamping!: ParserMethod<unknown[], CstNode>
  retract!: ParserMethod<unknown[], CstNode>
  endOfProgramRewind!: ParserMethod<unknown[], CstNode>
  longOperatorMessage!: ParserMethod<unknown[], CstNode>
  operatorMessage!: ParserMethod<unknown[], CstNode>
  header!: ParserMethod<unknown[], CstNode>
  metricMode!: ParserMethod<unknown[], CstNode>
  inchMode!: ParserMethod<unknown[], CstNode>
  routMode!: ParserMethod<unknown[], CstNode>
  linearMove!: ParserMethod<unknown[], CstNode>
  circularClockwiseMove!: ParserMethod<unknown[], CstNode>
  circularCounterclockwiseMove!: ParserMethod<unknown[], CstNode>
  dwell!: ParserMethod<unknown[], CstNode>
  drillMode!: ParserMethod<unknown[], CstNode>
  cwCircle!: ParserMethod<unknown[], CstNode>
  ccwCircle!: ParserMethod<unknown[], CstNode>
  cutterCompensationOff!: ParserMethod<unknown[], CstNode>
  cutterCompensationLeft!: ParserMethod<unknown[], CstNode>
  cutterCompensationRight!: ParserMethod<unknown[], CstNode>
  absoluteMode!: ParserMethod<unknown[], CstNode>
  incrementalMode!: ParserMethod<unknown[], CstNode>
  zeroSet!: ParserMethod<unknown[], CstNode>
  headerEnd!: ParserMethod<unknown[], CstNode>

  constructor() {
    super(multiModeLexerDefinition, {
      recoveryEnabled: true,
      // maxLookahead: 2,
    })

    this.RULE("program", () => {
      this.MANY(() => {
        this.SUBRULE(this.command)
      })
    })

    this.RULE("command", () => {
      this.OR([
        { ALT: (): CstNode => this.SUBRULE(this.units) },
        { ALT: (): CstNode => this.SUBRULE(this.incrementalModeSwitch) },
        { ALT: (): CstNode => this.SUBRULE(this.compensationIndex) },
        { ALT: (): CstNode => this.SUBRULE(this.toolDefinition) },
        { ALT: (): CstNode => this.SUBRULE(this.toolChange) },
        { ALT: (): CstNode => this.SUBRULE(this.comment) },
        { ALT: (): CstNode => this.SUBRULE(this.move) },
        { ALT: (): CstNode => this.SUBRULE(this.endOfProgramNoRewind) },
        { ALT: (): CstNode => this.SUBRULE(this.beginPattern) },
        { ALT: (): CstNode => this.SUBRULE(this.endOfPattern) },
        { ALT: (): CstNode => this.SUBRULE(this.repeatPatternOffset) },
        { ALT: (): CstNode => this.SUBRULE(this.optionalStop) },
        { ALT: (): CstNode => this.SUBRULE(this.endOfStepAndRepeat) },
        { ALT: (): CstNode => this.SUBRULE(this.stopForInspect) },
        { ALT: (): CstNode => this.SUBRULE(this.zAxisRoutPositionWithDepthControlledCountoring) },
        { ALT: (): CstNode => this.SUBRULE(this.zAxisRoutPosition) },
        { ALT: (): CstNode => this.SUBRULE(this.retractWithClamping) },
        { ALT: (): CstNode => this.SUBRULE(this.retract) },
        { ALT: (): CstNode => this.SUBRULE(this.endOfProgramRewind) },
        { ALT: (): CstNode => this.SUBRULE(this.longOperatorMessage) },
        { ALT: (): CstNode => this.SUBRULE(this.operatorMessage) },
        { ALT: (): CstNode => this.SUBRULE(this.header) },
        { ALT: (): CstNode => this.SUBRULE(this.metricMode) },
        { ALT: (): CstNode => this.SUBRULE(this.inchMode) },
        { ALT: (): CstNode => this.SUBRULE(this.routMode) },
        { ALT: (): CstNode => this.SUBRULE(this.linearMove) },
        { ALT: (): CstNode => this.SUBRULE(this.circularClockwiseMove) },
        { ALT: (): CstNode => this.SUBRULE(this.circularCounterclockwiseMove) },
        { ALT: (): CstNode => this.SUBRULE(this.dwell) },
        { ALT: (): CstNode => this.SUBRULE(this.drillMode) },
        { ALT: (): CstNode => this.SUBRULE(this.cwCircle) },
        { ALT: (): CstNode => this.SUBRULE(this.ccwCircle) },
        { ALT: (): CstNode => this.SUBRULE(this.cutterCompensationOff) },
        { ALT: (): CstNode => this.SUBRULE(this.cutterCompensationLeft) },
        { ALT: (): CstNode => this.SUBRULE(this.cutterCompensationRight) },
        { ALT: (): CstNode => this.SUBRULE(this.absoluteMode) },
        { ALT: (): CstNode => this.SUBRULE(this.incrementalMode) },
        { ALT: (): CstNode => this.SUBRULE(this.zeroSet) },
        { ALT: (): CstNode => this.SUBRULE(this.headerEnd) },

      ])
    })

    this.RULE("units", () => {
      this.CONSUME(DefaultTokens.Units)
      this.OPTION(() => {
        this.CONSUME(DefaultTokens.Comma)
        this.OR([
          { ALT: (): IToken => this.CONSUME(DefaultTokens.TrailingZeros) },
          { ALT: (): IToken => this.CONSUME(DefaultTokens.LeadingZeros) },
        ])
      })
      this.OPTION2(() => {
        this.CONSUME2(DefaultTokens.Comma)
        this.CONSUME(DefaultTokens.Number)
      })
    })

    this.RULE("incrementalModeSwitch", () => {
      this.CONSUME(DefaultTokens.IncrementalMode)
      this.CONSUME(DefaultTokens.Comma)
      this.OR([
        { ALT: (): IToken => this.CONSUME(DefaultTokens.On) },
        { ALT: (): IToken => this.CONSUME(DefaultTokens.Off) },
      ])
    })

    this.RULE("headerEnd", () => {
      this.CONSUME(DefaultTokens.Percent)
    })

    this.RULE("comment", () => {
      this.OR([
        { ALT: (): IToken => this.CONSUME(DefaultTokens.LParen) },
        { ALT: (): IToken => this.CONSUME(DefaultTokens.Semicolon) },
      ])
      this.OPTION(() => {
        this.CONSUME(CommentTokens.Attribute)
      })
      this.OPTION2(() => {
        this.CONSUME(CommentTokens.Text)
      })
      this.OPTION3(() => {
        this.OR2([
          { ALT: (): IToken => this.CONSUME(CommentTokens.NewLine) },
          { ALT: (): IToken => this.CONSUME(CommentTokens.RParen) },
        ])
      })
    })

    this.RULE("compensationIndex", () => {
      this.CONSUME(DefaultTokens.CP)
      this.CONSUME(DefaultTokens.Comma)
      this.CONSUME(DefaultTokens.Number)
      this.CONSUME2(DefaultTokens.Comma)
      this.CONSUME2(DefaultTokens.Number)
    })

    this.RULE("toolChange", () => {
      this.CONSUME(DefaultTokens.T)
    })

    this.RULE("toolDefinition", () => {
      this.CONSUME(DefaultTokens.T)
      this.SUBRULE(this.toolDia)
      this.MANY(() => {
        this.OR([
          { ALT: (): CstNode => this.SUBRULE(this.feed) },
          { ALT: (): CstNode => this.SUBRULE(this.speed) },
          { ALT: (): CstNode => this.SUBRULE(this.retractRate) },
          { ALT: (): CstNode => this.SUBRULE(this.hitCount) },
          { ALT: (): CstNode => this.SUBRULE(this.depthOffset) },
        ])
      })
    })

    this.RULE("toolDia", () => {
      this.CONSUME(DefaultTokens.C)
      this.CONSUME(DefaultTokens.Number)
    })

    this.RULE("feed", () => {
      this.CONSUME(DefaultTokens.F)
      this.OPTION(() => {
        this.CONSUME(DefaultTokens.Number)
      })
    })

    this.RULE("speed", () => {
      this.CONSUME(DefaultTokens.S)
      this.OPTION(() => {
        this.CONSUME(DefaultTokens.Number)
      })
    })

    this.RULE("retractRate", () => {
      this.CONSUME(DefaultTokens.B)
      this.CONSUME(DefaultTokens.Number)
    })

    this.RULE("hitCount", () => {
      this.CONSUME(DefaultTokens.H)
      this.CONSUME(DefaultTokens.Number)
    })

    this.RULE("depthOffset", () => {
      this.CONSUME(DefaultTokens.Z)
      this.CONSUME(DefaultTokens.Number)
    })

    this.RULE("x", () => {
      this.CONSUME(DefaultTokens.X)
      this.OPTION(() => {
        this.CONSUME(DefaultTokens.Number)
      })
    })

    this.RULE("y", () => {
      this.CONSUME(DefaultTokens.Y)
      this.OPTION(() => {
        this.CONSUME(DefaultTokens.Number)
      })
    })

    this.RULE("coordinate", () => {
      this.OR([
        { GATE: (): boolean => this.LA(1).endLine === this.LA(3).endLine, ALT: (): CstNode => this.SUBRULE(this.xy) },
        { ALT: (): CstNode => this.SUBRULE(this.xory) },
      ])
    })

    this.RULE("xy", () => {
      this.SUBRULE(this.x)
      this.SUBRULE(this.y)
    })

    this.RULE("xory", () => {
      this.OR([
        { ALT: (): CstNode => this.SUBRULE(this.x) },
        { ALT: (): CstNode => this.SUBRULE(this.y) },
      ])
    })

    this.RULE("arcRadius", () => {
      this.CONSUME(DefaultTokens.A)
      this.CONSUME(DefaultTokens.Number)
    })

    this.RULE("arcCenter", () => {
      this.CONSUME(DefaultTokens.I)
      this.CONSUME(DefaultTokens.Number)
      this.CONSUME(DefaultTokens.J)
      this.CONSUME2(DefaultTokens.Number)
    })

    this.RULE("move", () => {
      this.SUBRULE(this.coordinate)
      this.OPTION(() => {
        this.OR([
          { ALT: (): CstNode => this.SUBRULE(this.arcRadius) },
          { ALT: (): CstNode => this.SUBRULE(this.arcCenter) },
        ])
      })
    })

    this.RULE("endOfProgramNoRewind", () => {
      this.CONSUME(DefaultTokens.M00)
      this.OPTION(() => {
        this.SUBRULE(this.xy)
      })
    })

    this.RULE("beginPattern", () => {
      this.CONSUME(DefaultTokens.M25)
    })

    this.RULE("endOfPattern", () => {
      this.CONSUME(DefaultTokens.M01)
    })

    this.RULE("repeatPatternOffset", () => {
      this.CONSUME(DefaultTokens.M02)
      this.OPTION(() => {
        this.SUBRULE(this.coordinate)
      })
      this.MANY(() => {
        this.OR([
          { ALT: (): IToken => this.CONSUME(DefaultTokens.M70) },
          { ALT: (): IToken => this.CONSUME(DefaultTokens.M80) },
          { ALT: (): IToken => this.CONSUME(DefaultTokens.M90) },
        ])
      })
    })

    this.RULE("optionalStop", () => {
      this.CONSUME(DefaultTokens.M06)
      this.OPTION(() => {
        this.SUBRULE(this.xy)
      })
    })

    this.RULE("endOfStepAndRepeat", () => {
      this.CONSUME(DefaultTokens.M08)
    })

    this.RULE("stopForInspect", () => {
      this.CONSUME(DefaultTokens.M09)
      this.OPTION(() => {
        this.SUBRULE(this.xy)
      })
    })

    this.RULE("zAxisRoutPositionWithDepthControlledCountoring", () => {
      this.CONSUME(DefaultTokens.M14)
    })

    this.RULE("zAxisRoutPosition", () => {
      this.CONSUME(DefaultTokens.M15)
    })

    this.RULE("retractWithClamping", () => {
      this.CONSUME(DefaultTokens.M16)
    })

    this.RULE("retract", () => {
      this.CONSUME(DefaultTokens.M17)
    })

    this.RULE("endOfProgramRewind", () => {
      this.CONSUME(DefaultTokens.M30)
      this.OPTION(() => {
        this.SUBRULE(this.xy)
      })
    })

    this.RULE("longOperatorMessage", () => {
      this.CONSUME(DefaultTokens.M45)
      this.OPTION(() => {
        this.CONSUME(TextTokens.Text)
      })
      this.OPTION2(() => {
        this.CONSUME(TextTokens.EndText)
      })
    })

    this.RULE("operatorMessage", () => {
      this.CONSUME(DefaultTokens.M47)
      this.OPTION(() => {
        this.CONSUME(TextTokens.Text)
      })
      this.OPTION2(() => {
        this.CONSUME(TextTokens.EndText)
      })
    })

    this.RULE("header", () => {
      this.CONSUME(DefaultTokens.M48)
    })

    this.RULE("metricMode", () => {
      this.CONSUME(DefaultTokens.M71)
    })

    this.RULE("inchMode", () => {
      this.CONSUME(DefaultTokens.M72)
    })

    this.RULE("routMode", () => {
      this.CONSUME(DefaultTokens.G00)
      this.SUBRULE(this.move)
    })

    this.RULE("linearMove", () => {
      this.CONSUME(DefaultTokens.G01)
      this.SUBRULE(this.move)
    })

    this.RULE("circularClockwiseMove", () => {
      this.CONSUME(DefaultTokens.G02)
      this.SUBRULE(this.move)
    })

    this.RULE("circularCounterclockwiseMove", () => {
      this.CONSUME(DefaultTokens.G03)
      this.SUBRULE(this.move)
    })

    this.RULE("dwell", () => {
      this.CONSUME(DefaultTokens.G04)
      this.CONSUME(DefaultTokens.Number)
    })

    this.RULE("drillMode", () => {
      this.CONSUME(DefaultTokens.G05)
    })

    this.RULE("cwCircle", () => {
      this.CONSUME(DefaultTokens.G32)
      this.SUBRULE(this.move)
    })

    this.RULE("ccwCircle", () => {
      this.CONSUME(DefaultTokens.G33)
      this.SUBRULE(this.move)
    })

    this.RULE("cutterCompensationOff", () => {
      this.CONSUME(DefaultTokens.G40)
    })

    this.RULE("cutterCompensationLeft", () => {
      this.CONSUME(DefaultTokens.G41)
    })

    this.RULE("cutterCompensationRight", () => {
      this.CONSUME(DefaultTokens.G42)
    })

    this.RULE("absoluteMode", () => {
      this.CONSUME(DefaultTokens.G90)
    })

    this.RULE("incrementalMode", () => {
      this.CONSUME(DefaultTokens.G91)
    })

    this.RULE("zeroSet", () => {
      this.CONSUME(DefaultTokens.G93)
      this.SUBRULE(this.xy)
    })



    this.performSelfAnalysis()
  }
}

export const parser = new NCParser()
export const productions: Record<string, Rule> = parser.getGAstProductions();

const GENERATEDTS = false
if (GENERATEDTS) {
  const dtsString = generateCstDts(productions);
  console.log(dtsString)
}

const BaseCstVisitor = parser.getBaseCstVisitorConstructor();
// const BaseCstVisitor = parser.getBaseCstVisitorConstructorWithDefaults();


interface NCState extends NCParams {
  plunged: boolean
  mode: Mode
  interpolationMode: InterpolateModeType
  currentTool: Symbols.StandardSymbol
  cutterCompensation: number
  cutterCompensationMode: CutterCompensation
  x: number
  y: number
  previousX: number
  previousY: number
  patternOffsetX: number
  patternOffsetY: number
  arcRadius?: number
  arcCenterOffset?: { i: number, j: number }
}

export interface NCParams {
  units: Units
  coordinateMode: CoordinateMode
  coordinateFormat: Format
  zeroSuppression: ZeroSuppression
}

const defaultTool: Symbols.StandardSymbol = new Symbols.NullSymbol({
  id: 'T00',
})

export class NCToShapesVisitor extends BaseCstVisitor {
  public result: Shapes.Shape[] = []
  public stepRepeatShapes: Shapes.Shape[][] = []
  public stepRepeats: Shapes.StepAndRepeat[] = []
  public state: NCState = {
    plunged: false,
    mode: Constants.DRILL,
    interpolationMode: Constants.LINE,
    units: 'inch',
    currentTool: defaultTool,
    cutterCompensation: 0,
    cutterCompensationMode: Constants.OFF,
    x: 0,
    y: 0,
    previousX: 0,
    previousY: 0,
    patternOffsetX: 0,
    patternOffsetY: 0,
    arcRadius: 0,
    coordinateMode: Constants.ABSOLUTE,
    coordinateFormat: [2, 4],
    zeroSuppression: 'trailing',
  }
  public toolStore: Partial<Record<string, Symbols.StandardSymbol>> = {}
  public compensationStore: Partial<Record<string, number>> = {}
  constructor(params: Partial<NCParams> = {}) {
    super();
    Object.assign(this.state, params)
    // This helper will detect any missing or redundant methods on this visitor
    this.validateVisitor();
  }

  program(ctx: Cst.ProgramCstChildren): void {
    ctx.command ? ctx.command.map(this.visit, this) : []
  }

  command(ctx: Cst.CommandCstChildren): void {
    Object.values(ctx).map(this.visit, this)
  }

  units(ctx: Cst.UnitsCstChildren): void {
    if (ctx.Units[0].image === 'METRIC') {
      this.state.units = Constants.MM
    } else {
      this.state.units = Constants.IN
    }
    if (ctx.TrailingZeros) {
      this.state.zeroSuppression = Constants.LEADING
    }
    if (ctx.LeadingZeros) {
      this.state.zeroSuppression = Constants.TRAILING
    }
    if (ctx.Number) {
      const [int, decimal] = ctx.Number[0].image.split('.')
      this.state.coordinateFormat = [int.length, decimal.length]
    }
  }

  incrementalModeSwitch(ctx: Cst.IncrementalModeSwitchCstChildren): void {
    this.state.coordinateMode = ctx.On ? Constants.INCREMENTAL : Constants.ABSOLUTE
  }

  headerEnd(ctx: Cst.HeaderCstChildren): void {
    console.log('headerEnd', ctx)
  }

  comment(ctx: Cst.CommentCstChildren): void {
    console.log('comment', ctx)
  }

  compensationIndex(ctx: Cst.CompensationIndexCstChildren): void {
    this.compensationStore[ctx.Number[0].image] = parseFloat(ctx.Number[1].image)
  }

  toolChange(ctx: Cst.ToolChangeCstChildren): void {
    const str = ctx.T[0].image
    const tool = str.slice(0, 3)
    let compensationIndex = str.slice(3)
    if (!compensationIndex) {
      compensationIndex = tool.slice(1)
    }
    this.state.currentTool = this.toolStore[tool] ?? defaultTool
    this.state.cutterCompensation = this.compensationStore[compensationIndex] ?? 0
  }

  toolDefinition(ctx: Cst.ToolDefinitionCstChildren): void {
    const dia = this.visit(ctx.toolDia) as number

    const attributes: AttributeCollection = {}

    if (ctx.feed) attributes.feed = this.visit(ctx.feed) as string
    if (ctx.speed) attributes.speed = this.visit(ctx.speed) as string
    if (ctx.retractRate) attributes.retractRate = this.visit(ctx.retractRate) as string
    if (ctx.hitCount) attributes.hitCount = this.visit(ctx.hitCount) as string
    if (ctx.depthOffset) attributes.depthOffset = this.visit(ctx.depthOffset) as string

    const tool = new Symbols.RoundSymbol({
      id: ctx.T[0].image,
      outer_dia: dia,
      inner_dia: 0,
      attributes
    })
    this.state.currentTool = tool
    this.toolStore[tool.id] = tool
  }

  toolDia(ctx: Cst.ToolDiaCstChildren): number {
    const dia = parseFloat(ctx.Number[0].image)
    return dia
  }

  feed(ctx: Cst.FeedCstChildren): string {
    if (ctx.Number) return ctx.Number[0].image
    return ''
  }

  speed(ctx: Cst.SpeedCstChildren): string {
    if (ctx.Number) return ctx.Number[0].image
    return ''
  }

  retractRate(ctx: Cst.RetractRateCstChildren): string {
    if (ctx.Number) ctx.Number[0].image
    return ''
  }

  hitCount(ctx: Cst.HitCountCstChildren): string {
    if (ctx.Number) return ctx.Number[0].image
    return ''
  }

  depthOffset(ctx: Cst.DepthOffsetCstChildren): string {
    if (ctx.Number) return ctx.Number[0].image
    return ''
  }

  x(ctx: Cst.XCstChildren): number | undefined {
    if (!ctx.Number) return
    const newx = this.parseCoordinate(ctx.Number[0].image)
    return newx
  }

  y(ctx: Cst.YCstChildren): number | undefined {
    if (!ctx.Number) return
    const newy = this.parseCoordinate(ctx.Number[0].image)
    return newy
  }

  xy(ctx: Cst.XyCstChildren): PossiblePoints {
    return {
      x: this.visit(ctx.x) as number | undefined,
      y: this.visit(ctx.y) as number | undefined,
    }
  }

  xory(ctx: Cst.XoryCstChildren): PossiblePoints {
    if (ctx.x) return { x: this.visit(ctx.x) as number | undefined }
    if (ctx.y) return { y: this.visit(ctx.y) as number | undefined }
    return {}
  }

  coordinate(ctx: Cst.CoordinateCstChildren): PossiblePoints {
    if (ctx.xy) return this.visit(ctx.xy) as PossiblePoints
    if (ctx.xory) return this.visit(ctx.xory) as PossiblePoints
    return {}
  }

  arcRadius(ctx: Cst.ArcRadiusCstChildren): void {
    this.state.arcRadius = this.parseCoordinate(ctx.Number[0].image)
    this.state.arcCenterOffset = undefined
  }

  arcCenter(ctx: Cst.ArcCenterCstChildren): void {
    const i = this.parseCoordinate(ctx.Number[0].image)
    const j = this.parseCoordinate(ctx.Number[1].image)
    this.state.arcCenterOffset = { i, j }
    this.state.arcRadius = undefined
  }

  move(ctx: Cst.MoveCstChildren): void {
    this.state.previousX = this.state.x
    this.state.previousY = this.state.y
    const { x, y } = this.visit(ctx.coordinate) as PossiblePoints
    if (this.state.coordinateMode === Constants.ABSOLUTE) {
      if (x !== undefined) this.state.x = x
      if (y !== undefined) this.state.y = y
    } else {
      if (x !== undefined) this.state.x += x
      if (y !== undefined) this.state.y += y
    }

    if (ctx.arcCenter) this.visit(ctx.arcCenter)
    if (ctx.arcRadius) this.visit(ctx.arcRadius)
    if (this.state.mode == Constants.DRILL) {
      this.result.push(new Shapes.Pad({
        x: this.state.x,
        y: this.state.y,
        symbol: this.state.currentTool,
      }))
    } else {
      if (this.state.plunged) {
        if (this.state.interpolationMode === Constants.LINE) {
          this.result.push(new Shapes.Line({
            xs: this.state.previousX,
            ys: this.state.previousY,
            xe: this.state.x,
            ye: this.state.y,
            symbol: this.state.currentTool,
            attributes: {
              cutterCompensation: (this.state.cutterCompensation).toString(),
              cutterCompensationMode: this.state.cutterCompensationMode,
            }
          }))
        } else {
          const startPoint = { x: this.state.previousX, y: this.state.previousY }
          const endPoint = { x: this.state.x, y: this.state.y }
          const radius = this.state.arcRadius ?? (this.state.arcCenterOffset ? (this.state.arcCenterOffset.i ** 2 + this.state.arcCenterOffset.j ** 2) ** 0.5 : 0)
          const center = getAmbiguousArcCenter(startPoint, endPoint, radius, this.state.interpolationMode == Constants.CW_ARC ? Constants.CW_ARC : Constants.CCW_ARC)
          this.result.push(new Shapes.Arc({
            xs: this.state.previousX,
            ys: this.state.previousY,
            xe: this.state.x,
            ye: this.state.y,
            xc: center.x,
            yc: center.y,
            clockwise: this.state.interpolationMode === Constants.CW_ARC ? 1 : 0,
            symbol: this.state.currentTool,
            attributes: {
              cutterCompensation: (this.state.cutterCompensation).toString(),
              cutterCompensationMode: this.state.cutterCompensationMode,
            }
          }))
        }
      }
    }
  }

  endOfProgramNoRewind(ctx: Cst.EndOfProgramNoRewindCstChildren): void {
    console.log('endOfProgramNoRewind', ctx)
  }

  beginPattern(_ctx: Cst.BeginPatternCstChildren): void {
    this.stepRepeatShapes.push(this.result)
    this.result = []

  }

  endOfPattern(_ctx: Cst.EndOfPatternCstChildren): void {
    this.stepRepeats.push(new Shapes.StepAndRepeat({
      shapes: this.result,
      repeats: [
        {
          datum: [0, 0],
          rotation: 0,
          scale: 1,
          mirror_x: 0,
          mirror_y: 0,
        }
      ],
    }))
    this.result = this.stepRepeatShapes.pop() ?? []

    this.state.patternOffsetX = 0
    this.state.patternOffsetY = 0
  }

  repeatPatternOffset(ctx: Cst.RepeatPatternOffsetCstChildren): void {
    if (ctx.coordinate) {
      const { x, y } = this.visit(ctx.coordinate) as PossiblePoints
      this.state.patternOffsetX += x ?? 0
      this.state.patternOffsetY += y ?? 0
      let mirror_x: Binary = 0
      let mirror_y: Binary = 0
      let rotation: number = 0
      if (ctx.M80) {
        mirror_x = 1
      }
      if (ctx.M90) {
        mirror_y = 1
      }
      if (ctx.M70) {
        mirror_y = mirror_y ? 0 : 1
        rotation = 90
      }
      this.stepRepeats[0].repeats.push({
        datum: [this.state.patternOffsetX, this.state.patternOffsetY],
        rotation,
        scale: 1,
        mirror_x,
        mirror_y,
      })
    } else {
      // if (this.stepRepeats.length) this.result.push(this.stepRepeats.pop() as Shapes.StepAndRepeat)
    }
  }

  endOfStepAndRepeat(_ctx: Cst.EndOfStepAndRepeatCstChildren): void {
    if (this.stepRepeats.length) this.result.push(this.stepRepeats.pop() as Shapes.StepAndRepeat)
    this.state.patternOffsetX = 0
    this.state.patternOffsetY = 0
  }

  optionalStop(ctx: Cst.OptionalStopCstChildren): void {
    console.log('optionalStop', ctx)
  }

  stopForInspect(ctx: Cst.StopForInspectCstChildren): void {
    console.log('stopForInspect', ctx)
  }

  zAxisRoutPositionWithDepthControlledCountoring(_ctx: Cst.ZAxisRoutPositionWithDepthControlledCountoringCstChildren): void {
    this.state.plunged = true
  }

  zAxisRoutPosition(_ctx: Cst.ZAxisRoutPositionCstChildren): void {
    this.state.plunged = true
  }

  retractWithClamping(_ctx: Cst.RetractWithClampingCstChildren): void {
    this.state.plunged = false
  }

  retract(_ctx: Cst.RetractCstChildren): void {
    this.state.plunged = false
  }

  endOfProgramRewind(ctx: Cst.EndOfProgramRewindCstChildren): void {
    console.log('endOfProgramRewind', ctx)
  }

  longOperatorMessage(ctx: Cst.LongOperatorMessageCstChildren): void {
    console.log('longOperatorMessage', ctx)
  }

  operatorMessage(ctx: Cst.OperatorMessageCstChildren): void {
    console.log('operatorMessage', ctx)
  }

  header(ctx: Cst.HeaderCstChildren): void {
    console.log('header', ctx)
  }

  metricMode(_ctx: Cst.MetricModeCstChildren): void {
    this.state.units = Constants.MM
  }

  inchMode(_ctx: Cst.InchModeCstChildren): void {
    this.state.units = Constants.IN
  }

  routMode(ctx: Cst.RoutModeCstChildren): void {
    this.state.mode = Constants.ROUT
    // this is questionable
    this.state.plunged = false
    this.visit(ctx.move)
  }

  linearMove(ctx: Cst.LinearMoveCstChildren): void {
    this.state.interpolationMode = Constants.LINE
    // this is questionable
    this.state.plunged = true
    this.visit(ctx.move)
  }

  circularClockwiseMove(ctx: Cst.CircularClockwiseMoveCstChildren): void {
    this.state.interpolationMode = Constants.CW_ARC
    // this is questionable
    this.state.plunged = true
    this.visit(ctx.move)
  }

  circularCounterclockwiseMove(ctx: Cst.CircularCounterclockwiseMoveCstChildren): void {
    this.state.interpolationMode = Constants.CCW_ARC
    // this is questionable
    this.state.plunged = true
    this.visit(ctx.move)
  }

  dwell(ctx: Cst.DwellCstChildren): void {
    console.log('dwell', ctx)
  }

  drillMode(_ctx: Cst.DrillModeCstChildren): void {
    this.state.plunged = false
  }

  cwCircle(ctx: Cst.CwCircleCstChildren): void {
    const prevMode = this.state.mode
    this.state.mode = Constants.ROUT
    this.state.plunged = false
    this.visit(ctx.move)
    let radius = this.state.arcRadius ?? (this.state.arcCenterOffset ? (this.state.arcCenterOffset.i ** 2 + this.state.arcCenterOffset.j ** 2) ** 0.5 : 0)
    radius = radius - this.state.currentTool.outer_dia / 2
    this.result.push(new Shapes.Arc({
      xs: this.state.x - radius,
      ys: this.state.y - radius,
      xe: this.state.x - radius,
      ye: this.state.y - radius,
      xc: this.state.x,
      yc: this.state.y,
      clockwise: 1,
      symbol: this.state.currentTool,
    }))
    this.state.mode = prevMode
  }

  ccwCircle(ctx: Cst.CcwCircleCstChildren): void {
    const prevMode = this.state.mode
    this.state.mode = Constants.ROUT
    this.state.plunged = false
    this.visit(ctx.move)
    let radius = this.state.arcRadius ?? (this.state.arcCenterOffset ? (this.state.arcCenterOffset.i ** 2 + this.state.arcCenterOffset.j ** 2) ** 0.5 : 0)
    radius = radius - this.state.currentTool.outer_dia / 2
    this.result.push(new Shapes.Arc({
      xs: this.state.x - radius,
      ys: this.state.y - radius,
      xe: this.state.x - radius,
      ye: this.state.y - radius,
      xc: this.state.x,
      yc: this.state.y,
      clockwise: 0,
      symbol: this.state.currentTool,
    }))
    this.state.mode = prevMode
  }

  cutterCompensationOff(_ctx: Cst.CutterCompensationOffCstChildren): void {
    this.state.cutterCompensationMode = Constants.OFF
  }

  cutterCompensationLeft(_ctx: Cst.CutterCompensationLeftCstChildren): void {
    this.state.cutterCompensationMode = Constants.LEFT
  }

  cutterCompensationRight(_ctx: Cst.CutterCompensationRightCstChildren): void {
    this.state.cutterCompensationMode = Constants.RIGHT
  }

  absoluteMode(_ctx: Cst.AbsoluteModeCstChildren): void {
    this.state.coordinateMode = Constants.ABSOLUTE
  }

  incrementalMode(_ctx: Cst.IncrementalModeCstChildren): void {
    this.state.coordinateMode = Constants.INCREMENTAL
  }

  zeroSet(ctx: Cst.ZeroSetCstChildren): void {
    console.log('zeroSet', ctx)
  }

  parseCoordinate(
    coordinate: string,
  ): number {
    if (coordinate.includes('.') || coordinate === '0') {
      return Number(coordinate)
    }

    const { coordinateFormat, zeroSuppression } = this.state
    let [integerPlaces, decimalPlaces] = coordinateFormat
    const [sign, signlessCoordinate] =
      coordinate.startsWith('+') || coordinate.startsWith('-')
        ? [coordinate[0], coordinate.slice(1)]
        : ['+', coordinate]

    if (signlessCoordinate.length > integerPlaces + decimalPlaces) {
      this.state.coordinateFormat = [coordinate.length - decimalPlaces, decimalPlaces]
    }
    [integerPlaces, decimalPlaces] = this.state.coordinateFormat
    const digits = integerPlaces + decimalPlaces
    const paddedCoordinate =
      zeroSuppression === Constants.TRAILING
        ? signlessCoordinate.padEnd(digits, '0')
        : signlessCoordinate.padStart(digits, '0')

    const leading = paddedCoordinate.slice(0, paddedCoordinate.length - decimalPlaces)
    const trailing = paddedCoordinate.slice(paddedCoordinate.length - decimalPlaces)

    return Number(`${sign}${leading}.${trailing}`)
  }


}



export function getAmbiguousArcCenter(startPoint: Point, endPoint: Point, radius: number, arcDirection: ArcDirection): Point {
  // Get the center candidates and select the candidate with the smallest arc
  const [_start, _end, center] = findCenterCandidates(startPoint, endPoint, radius)
    .map(centerPoint => {
      return getArcPositions(startPoint, endPoint, centerPoint, arcDirection)
    })
    .sort(([startA, endA], [startB, endB]) => {
      const absSweepA = Math.abs(endA[2] - startA[2])
      const absSweepB = Math.abs(endB[2] - startB[2])
      return absSweepA - absSweepB
    })[0]

  return {
    x: center[0],
    y: center[1],
  }
}


export function getArcPositions(
  startPoint: Point,
  endPoint: Point,
  centerPoint: Point,
  arcDirection: ArcDirection
): [start: ArcPosition, end: ArcPosition, center: Position] {
  let startAngle = Math.atan2(
    startPoint.y - centerPoint.y,
    startPoint.x - centerPoint.x
  )
  let endAngle = Math.atan2(
    endPoint.y - centerPoint.y,
    endPoint.x - centerPoint.x
  )

  // If counter-clockwise, end angle should be greater than start angle
  if (arcDirection === Constants.CCW_ARC) {
    endAngle = endAngle > startAngle ? endAngle : endAngle + (Math.PI * 2)
  } else {
    startAngle = startAngle > endAngle ? startAngle : startAngle + (Math.PI * 2)
  }

  return [
    [startPoint.x, startPoint.y, startAngle],
    [endPoint.x, endPoint.y, endAngle],
    [centerPoint.x, centerPoint.y],
  ]
}

// Find arc center candidates by finding the intersection points
// of two circles with `radius` centered on the start and end points
// https://math.stackexchange.com/a/1367732
function findCenterCandidates(startPoint: Point, endPoint: Point, radius: number): Point[] {
  // This function assumes that start and end are different points
  const { x: x1, y: y1 } = startPoint
  const { x: x2, y: y2 } = endPoint

  // Distance between the start and end points
  const [dx, dy] = [x2 - x1, y2 - y1]
  const [sx, sy] = [x2 + x1, y2 + y1]
  const distance = Math.sqrt(dx ** 2 + dy ** 2)

  // If the distance to the midpoint equals the arc radius, then there is
  // exactly one intersection at the midpoint; if the distance to the midpoint
  // is greater than the radius, assume we've got a rounding error and just use
  // the midpoint
  if (radius <= distance / 2) {
    return [{ x: x1 + dx / 2, y: y1 + dy / 2 }]
  }

  // No good name for these variables, but it's how the math works out
  const factor = Math.sqrt((4 * radius ** 2) / distance ** 2 - 1)
  const [xBase, yBase] = [sx / 2, sy / 2]
  const [xAddend, yAddend] = [(dy * factor) / 2, (dx * factor) / 2]

  return [
    { x: xBase + xAddend, y: yBase - yAddend },
    { x: xBase - xAddend, y: yBase + yAddend },
  ]
}


// TODO: add support for more excellon Canned Cycle Commands

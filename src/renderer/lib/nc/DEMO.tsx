import React from 'react'
import { parse } from './parser'
import { CodeHighlight } from '@mantine/code-highlight';
import { Flex } from '@mantine/core'
import { ChildNode } from './parser/tree'
import { plot } from './plotter';
import { Shape } from '@src/renderer/shapes';

const drill = `\
INCH,TZ
%
M48
M72
T01C0.0200
T02C0.0250
T03C0.0300
T04C0.0354
T05C0.0400
T06C0.1260
%
T01
X7536Y4995
X9702Y6569
X11080Y6569
X12887Y8288
X13512Y8351
X11374Y8617
X10324Y8367
X9724Y8567
X10574Y9667
X10574Y10517
X10474Y11167
X11774Y10567
X13474Y11067
X11674Y12067
X10004Y13267
X8637Y13851
X7824Y15226
X10224Y16192
X11387Y17601
X13245Y17514
X13245Y18184
X13712Y16205
X12524Y15267
X13712Y14892
X15024Y14892
X14724Y13767
X13924Y12517
X16924Y11567
X15474Y10667
X16974Y10367
X18967Y9125
X19524Y9477
X19714Y10367
X22137Y9167
X22637Y8667
X23037Y8167
X21924Y7517
X21624Y6667
X19824Y6667
X19724Y7167
X18979Y7107
X17274Y8317
X17124Y8867
X18424Y8710
X22906Y9817
X22712Y11267
X23416Y11884
X22365Y12396
X21593Y12267
X19735Y13832
X17574Y14226
X18762Y16288
X16637Y17351
X17182Y18184
X21119Y18184
X21119Y17378
X23487Y18184
X24859Y18774
X27615Y16018
X26684Y14757
X26664Y13405
X26644Y11415
X26044Y9147
X25254Y8157
X23424Y6767
X23824Y6267
X24859Y4995
X27615Y7750
X20387Y5601
X8514Y10777
X6355Y10310
X7714Y9137
X4780Y7750
X6355Y11687
X11537Y14267
X4780Y16018
X7536Y18774
X9308Y18184
X21887Y15601
X23876Y15677
T02
X22406Y14267
X15012Y7288
T03
X15474Y9217
X16774Y12467
X13699Y15601
X6724Y15442
T04
X6454Y12750
X6454Y11018
T05
X14198Y5979
X15198Y5979
X16198Y5979
X17198Y5979
X18198Y5979
X24162Y9884
X25162Y9884
X25162Y10884
X24162Y10884
X24162Y11884
X25162Y11884
X25162Y12884
X24162Y12884
X24162Y13884
X25162Y13884
T06
X26434Y17593
X26434Y6176
X5961Y6176
X5961Y17593
M30

`

const tree = parse(drill)
const shapes = plot(tree)

export default function NCDemo(): JSX.Element {
  const [highlightedLines, setHighlightedLines] = React.useState<number[]>([])

  // React.useEffect(() => {
  //   console.log(highlightedLines)
  // }, [highlightedLines])


  return <div
    style={{
      height: '100vh',
      overflow: 'hidden'
    }}>
    <Flex
      justify="center"
      align="flex-start"
      style={{
        height: '100%',
        width: '100%'
      }}
    >
      <div
        style={{
          overflow: 'auto',
          height: '100%',
          width: '100%'
        }}>
        {drill.split(/\r?\n/).map((line, i) => <RawLine
          highlightedLines={highlightedLines}
          setHighlightedLines={setHighlightedLines}
          key={i}
          line={line}
          i={i+1} />)}
      </div>
      <div
        style={{
          overflow: 'auto',
          height: '100%',
          width: '100%'
        }}>
        {tree.children.map((child, i) => {
          return <ParsedLine
            highlightedLines={highlightedLines}
            setHighlightedLines={setHighlightedLines}
            key={i}
            child={child} />
        })}
      </div>
      <div
        style={{
          overflow: 'auto',
          height: '100%',
          width: '100%'
        }}>
        {shapes.children.map((shape, i) => {
          return <ShapeLine
            highlightedLines={highlightedLines}
            setHighlightedLines={setHighlightedLines}
            key={i}
            shape={shape} />
        })}
      </div>
    </Flex>
  </div>
}

const useHighlight = <E extends HTMLDivElement>(highlight?: boolean): React.Ref<E> => {
  const element = React.useRef<E>(null)

  React.useEffect(() => {
    if (highlight === true) {
      element.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [highlight])

  return element
}


interface RawLineProps {
  i: number
  line: string
  highlightedLines: number[]
  setHighlightedLines: (lines: number[]) => unknown
}

function RawLine(props: RawLineProps): JSX.Element {
  const { i, line, highlightedLines, setHighlightedLines, } = props
  const highlight =
    i >= Math.min(...highlightedLines) &&
    i <= Math.max(...highlightedLines)
  const targetRef = useHighlight(highlight)

  return <CodeHighlight
    styles={{
      pre: {
        paddingTop: 0,
        paddingBottom: 0
      }
    }}
    style={{
      backgroundColor: highlight ? 'rgb(30,30,30)' : ''
    }}
    ref={targetRef}
    withCopyButton={false}
    code={line}
    onMouseEnter={() => setHighlightedLines([i])}
    onMouseLeave={() => setHighlightedLines([])}
  >
  </CodeHighlight>
}

interface ParsedLineProps {
  child: ChildNode
  highlightedLines: number[]
  setHighlightedLines: (lines: number[]) => unknown
}

function ParsedLine(props: ParsedLineProps): JSX.Element {
  const {
    child,
    highlightedLines,
    setHighlightedLines,
  } = props
  const { position, ...obj } = child
  const startLine = position?.start.line
  const endLine = position?.end.line
  const highlight = highlightedLines.some(
    highlightedLine =>
      startLine !== undefined &&
      endLine !== undefined &&
      startLine <= highlightedLine &&
      endLine >= highlightedLine
  )
  const lines = [startLine, endLine].filter((n): n is number => n !== undefined)
  const targetRef = useHighlight(highlight)

  return <CodeHighlight
    styles={{
      pre: {
        paddingTop: 0,
        paddingBottom: 0
      }
    }}
    style={{
      backgroundColor: highlight ? 'rgb(30,30,30)' : ''
    }}
    withCopyButton={false}
    onMouseEnter={() => setHighlightedLines(lines)}
    onMouseLeave={() => setHighlightedLines([])}
    ref={targetRef}
    code={JSON.stringify(obj, null, 2)}
    language="json"
  />
}


interface ShapeLineProps {
  shape: Shape
  highlightedLines: number[]
  setHighlightedLines: (lines: number[]) => unknown
}

function ShapeLine(props: ShapeLineProps): JSX.Element {
  const {
    shape,
    highlightedLines,
    setHighlightedLines,
  } = props
  // const { position, ...obj } = shape
  // const startLine = position?.start.line
  // const endLine = position?.end.line
  // const highlight = highlightedLines.some(
  //   highlightedLine =>
  //     startLine !== undefined &&
  //     endLine !== undefined &&
  //     startLine <= highlightedLine &&
  //     endLine >= highlightedLine
  // )
  // const lines = [startLine, endLine].filter((n): n is number => n !== undefined)
  // const targetRef = useHighlight(highlight)

  return <CodeHighlight
    styles={{
      pre: {
        paddingTop: 0,
        paddingBottom: 0
      }
    }}
    style={{
      // backgroundColor: highlight ? 'rgb(30,30,30)' : ''
    }}
    withCopyButton={false}
    // onMouseEnter={() => setHighlightedLines(lines)}
    // onMouseLeave={() => setHighlightedLines([])}
    // ref={targetRef}
    code={JSON.stringify(shape, null, 2)}
    language="json"
  />
}

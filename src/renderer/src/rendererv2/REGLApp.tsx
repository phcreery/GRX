import React from 'react'
import '../App.css'
import {
  STANDARD_SYMBOLS,
  STANDARD_SYMBOLS_MAP,
  StandardSymbol
} from './symbols'
import {
  Pad_Record,
  Line_Record,
  Arc_Record,
  Surface_Record,
  Contour_Record,
  Contour_Arc_Segment_Record,
  Contour_Line_Segment_Record,
} from './records'
import { RenderEngine } from './engine'
import { Button, Switch } from '@mantine/core'
import { IPlotRecord } from './types'
import { ptr, malloc } from './utils'
import { SymbolCollection } from './collections'

// N == Number of Shapes
const N_PADS = 1000
const N_LINES = 50
const N_ARCS = 50
const N_SURFACES = 3

const SURFACE_RECORDS_ARRAY = new Array<IPlotRecord>(N_SURFACES)
  .fill(new Surface_Record({}))
  .map((_, i) => {
    console.log(i)
    return new Surface_Record({
      // index of feature
      // index: i / N_SURFACES,
      polarity: 1,
    }).addContours([
      new Contour_Record({
        poly_type: 1,
        // Start point.
        xs: 0 + i,
        ys: 0 + i,
      })
        .addSegments([
          // new Contour_Line_Segment_Record({
          //   x: 0.2 + i,
          //   y: -0.2 + i,
          // }),
          new Contour_Arc_Segment_Record({
            x: 0.2 + i,
            y: -0.2 + i,
            xc: 0.15 + i,
            yc: -0.05 + i,
            // computer the center coordinates of the arc with a radius of 0.1
            clockwise: 1,
          }),
          new Contour_Line_Segment_Record({
            x: 0.5 + i,
            y: -0.2 + i,
          }),
          new Contour_Line_Segment_Record({
            x: 0.5 + i,
            y: 0.5 + i,
          }),
          new Contour_Line_Segment_Record({
            x: -0.5 + i,
            y: 0.5 + i,
          }),
          new Contour_Line_Segment_Record({
            x: -0.5 + i,
            y: -0.5 + i,
          }),
          // new Contour_Arc_Segment_Record({
          //   x: -0.5 + i,
          //   y: -0.5 + i,
          //   xc: -0.5 + i,
          //   yc: 0 + i,
          //   // computer the center coordinates of the arc with a radius of 0.1
          //   clockwise: 0,
          // }),
          new Contour_Line_Segment_Record({
            x: 0 + i,
            y: 0 + i,
          }),
        ]),
      new Contour_Record({
        poly_type: 0,
        // Start point.
        xs: 0.4 + i,
        ys: 0.4 + i,
      })
        .addSegments([
          new Contour_Line_Segment_Record({
            x: 0.4 + i,
            y: 0.3 + i,
          }),
          new Contour_Line_Segment_Record({
            x: 0.3 + i,
            y: 0.3 + i,
          }),
          new Contour_Line_Segment_Record({
            x: 0.3 + i,
            y: 0.4 + i,
          }),
          new Contour_Line_Segment_Record({
            x: 0.4 + i,
            y: 0.4 + i,
          }),
        ])
    ])
  })

// console.log(SURFACE_RECORDS_ARRAY)

const SYMBOLS: ptr<StandardSymbol>[] = []

let round = new StandardSymbol({
  id: 'round', // id
  symbol: STANDARD_SYMBOLS_MAP.Round, // symbol
  width: 0.01, // width, square side, diameter
  height: 0.01, // height
  corner_radius: 0.002, // corner radius
  corners: 15, // — Indicates which corners are rounded. x<corners> is omitted if all corners are rounded.
  outer_dia: 0.01, // — Outer diameter of the shape
  inner_dia: 0.008, // — Inner diameter of the shape
  line_width: 0.001, // — Line width of the shape (applies to the whole shape)
  line_length: 0.02, // — Line length of the shape (applies to the whole shape)
  angle: 0, // — Angle of the spoke from 0 degrees
  gap: 0.001, // — Gap
  num_spokes: 2, // — Number of spokes
  round: 0, // —r|s == 1|0 — Support for rounded or straight corners
  cut_size: 0, // — Size of the cut ( see corner radius )
  ring_width: 0.001, // — Ring width
  ring_gap: 0.004, // — Ring gap
  num_rings: 2 // — Number of rings
})
const round_sym_ptr = ptr(() => round, v => round = v)
SYMBOLS.push(round_sym_ptr)

let square = new StandardSymbol({
  id: 'round', // id
  symbol: STANDARD_SYMBOLS_MAP.Square, // symbol
  width: 0.01, // width, square side, diameter
  height: 0.01, // height
  corner_radius: 0.002, // corner radius
  corners: 15, // — Indicates which corners are rounded. x<corners> is omitted if all corners are rounded.
  outer_dia: 0.01, // — Outer diameter of the shape
  inner_dia: 0.008, // — Inner diameter of the shape
  line_width: 0.001, // — Line width of the shape (applies to the whole shape)
  line_length: 0.02, // — Line length of the shape (applies to the whole shape)
  angle: 0, // — Angle of the spoke from 0 degrees
  gap: 0.001, // — Gap
  num_spokes: 2, // — Number of spokes
  round: 0, // —r|s == 1|0 — Support for rounded or straight corners
  cut_size: 0, // — Size of the cut ( see corner radius )
  ring_width: 0.001, // — Ring width
  ring_gap: 0.004, // — Ring gap
  num_rings: 2 // — Number of rings
})
const square_sym_ptr = ptr(() => square, v => square = v)
SYMBOLS.push(square_sym_ptr)

let square2 = new StandardSymbol({
  id: 'round', // id
  symbol: STANDARD_SYMBOLS_MAP.Square, // symbol
  width: 0.01, // width, square side, diameter
  height: 0.01, // height
  corner_radius: 0.002, // corner radius
  corners: 15, // — Indicates which corners are rounded. x<corners> is omitted if all corners are rounded.
  outer_dia: 0.01, // — Outer diameter of the shape
  inner_dia: 0.008, // — Inner diameter of the shape
  line_width: 0.001, // — Line width of the shape (applies to the whole shape)
  line_length: 0.02, // — Line length of the shape (applies to the whole shape)
  angle: 0, // — Angle of the spoke from 0 degrees
  gap: 0.001, // — Gap
  num_spokes: 2, // — Number of spokes
  round: 0, // —r|s == 1|0 — Support for rounded or straight corners
  cut_size: 0, // — Size of the cut ( see corner radius )
  ring_width: 0.001, // — Ring width
  ring_gap: 0.004, // — Ring gap
  num_rings: 2 // — Number of rings
})
const square2_sym_ptr = ptr(() => square2, v => square2 = v)
SYMBOLS.push(square2_sym_ptr)

new Array<ptr<IPlotRecord>>(STANDARD_SYMBOLS.length)
// .fill(new Symbol({}))
.fill(malloc<IPlotRecord>(new StandardSymbol({})))
.map((_, i) => {
  let sym = new StandardSymbol({
    id: 'symbol' + i, // id
    symbol: i, // symbol
    width: 0.01, // width, square side, diameter
    height: 0.01, // height
    corner_radius: 0.002, // corner radius
    corners: 15, // — Indicates which corners are rounded. x<corners> is omitted if all corners are rounded.
    outer_dia: 0.01, // — Outer diameter of the shape
    inner_dia: 0.008, // — Inner diameter of the shape
    line_width: 0.001, // — Line width of the shape (applies to the whole shape)
    line_length: 0.02, // — Line length of the shape (applies to the whole shape)
    angle: 0, // — Angle of the spoke from 0 degrees
    gap: 0.001, // — Gap
    num_spokes: 2, // — Number of spokes
    round: 0, // —r|s == 1|0 — Support for rounded or straight corners
    cut_size: 0, // — Size of the cut ( see corner radius )
    ring_width: 0.001, // — Ring width
    ring_gap: 0.004, // — Ring gap
    num_rings: 2 // — Number of rings
  })
  const sym_ptr = ptr(() => sym, v => sym = v)
  SYMBOLS.push(sym_ptr)
})


const PAD_RECORDS_ARRAY = new Array<IPlotRecord>(N_PADS)
  .fill(new Pad_Record({}))
  .map((_, i) => {
    return new Pad_Record({
      // index of feature
      // index: i / N_PADS,
      // index: (i) / (N_LINES + N_PADS),
      // Center point.
      x: (Math.random() - 0.5) * 1,
      y: (Math.random() - 0.5) * 1,
      // The index, in the feature symbol names section, of the symbol to be used to draw the pad.
      // sym_num: i % Object.keys(STANDARD_SYMBOLS).length,
      symbol: SYMBOLS[i % SYMBOLS.length],
      // sym_num: i % 2 == 0 ? STANDARD_SYMBOLS_MAP.Square : STANDARD_SYMBOLS_MAP.Round,
      // The symbol with index <sym_num> is enlarged or shrunk by factor <resize_factor>.
      resize_factor: Math.random() + 1,
      // Polarity. 0 = negative, 1 = positive
      // polarity: i % 2,
      polarity: Math.random() > 0.5 ? 1 : 0,
      // Pad orientation (degrees)
      rotation: Math.random() * 360,
      // 0 = no mirror, 1 = mirror
      mirror: 0
    })
  })

const LINE_RECORDS_ARRAY_NEG = new Array<IPlotRecord>(N_LINES)
  .fill(new Line_Record({}))
  .map((_, i) => {
    return new Line_Record({
      // index of feature
      index: i,
      // index: (i + N_PADS) / (N_LINES + N_PADS),

      // Start point.
      xs: (Math.random() - 0.5) * 1,
      ys: (Math.random() - 0.5) * 1,

      // End point.
      xe: (Math.random() - 0.5) * 1,
      ye: (Math.random() - 0.5) * 1,

      // The index, in the feature symbol names section, of the symbol to be used to draw the pad.
      // sym_num: i % 2 == 0 ? STANDARD_SYMBOLS_MAP.Square : STANDARD_SYMBOLS_MAP.Round,
      symbol: i % 2 == 0 ? square_sym_ptr : round_sym_ptr,
      // The symbol with index <sym_num> is enlarged or shrunk by factor <resize_factor>.
      // Polarity. 0 = negative, 1 = positive
      // polarity: i % 2,
      // polarity: Math.random() > 0.5 ? 1 : 0,
      polarity: 0,
    })
  })

const LINE_RECORDS_ARRAY_POS = new Array<IPlotRecord>(N_LINES)
  .fill(new Line_Record({}))
  .map((_, i) => {
    return new Line_Record({
      // index of feature
      index: i,

      // Start point.
      xs: (Math.random() - 0.5) * 1,
      ys: (Math.random() - 0.5) * 1,

      // End point.
      xe: (Math.random() - 0.5) * 1,
      ye: (Math.random() - 0.5) * 1,

      // The index, in the feature symbol names section, of the symbol to be used to draw the pad.
      // sym_num: i % 2 == 0 ? STANDARD_SYMBOLS_MAP.Square : STANDARD_SYMBOLS_MAP.Round,
      symbol: i % 2 == 0 ? square_sym_ptr : round_sym_ptr,
      // The symbol with index <sym_num> is enlarged or shrunk by factor <resize_factor>.
      // Polarity. 0 = negative, 1 = positive
      // polarity: i % 2,
      // polarity: Math.random() > 0.5 ? 1 : 0,
      polarity: 1,
    })
  })


const ARC_RECORDS_ARRAY = new Array<IPlotRecord>(N_ARCS)
  .fill(new Arc_Record({}))
  .map((_, i) => {
    const start_angle = Math.abs(Math.random()) * 360
    const end_angle = Math.abs(Math.random()) * 360
    const radius = Math.abs(Math.random()) * 0.1
    const center_x = (Math.random() - 0.5) * 1
    const center_y = (Math.random() - 0.5) * 1
    function degreesToRadians(degrees: number): number {
      return degrees * (Math.PI / 180);
    }
    return new Arc_Record({
      // index of feature
      // index: i / N_ARCS,

      // Center point.
      xc: center_x,
      yc: center_y,

      // Start point.
      xs: center_x + Math.cos(degreesToRadians(start_angle)) * radius,
      ys: center_y + Math.sin(degreesToRadians(start_angle)) * radius,

      // End point.
      xe: center_x + Math.cos(degreesToRadians(end_angle)) * radius,
      ye: center_y + Math.sin(degreesToRadians(end_angle)) * radius,

      // The index, in the feature symbol names section, of the symbol to be used to draw the pad.
      // sym_num: STANDARD_SYMBOLS_MAP.Round,
      symbol: round_sym_ptr,
      // The symbol with index <sym_num> is enlarged or shrunk by factor <resize_factor>.
      // Polarity. 0 = negative, 1 = positive
      polarity: 0,
      // polarity: Math.random() > 0.5 ? 1 : 0,
      clockwise: Math.random() > 0.5 ? 1 : 0,
      // clockwise: 0,
    })
  })



function REGLApp(): JSX.Element {
  const containerRef = React.useRef<HTMLDivElement>(document.createElement('div'))
  const [engine, setEngine] = React.useState<RenderEngine>()

  React.useEffect(() => {
    const Engine = new RenderEngine({
      container: containerRef.current,
      attributes: {
        antialias: false,
      }
    })

    // DictionaryStandard
    // DictionaryUser
    // DictionaryFont

    Engine.SETTINGS.OUTLINE_MODE = false
    // Engine.SETTINGS.BACKGROUND_COLOR = [1, 1, 1, 1]


    // Engine.addDictionary({}_)

    Engine.addLayer({
      name: 'layer0',
      standardSymbols: SYMBOLS,
      image: [...PAD_RECORDS_ARRAY]
    })

    Engine.addLayer({
      name: 'layer1',
      standardSymbols: SYMBOLS,
      image: [...LINE_RECORDS_ARRAY_POS, ...LINE_RECORDS_ARRAY_NEG]
    })



    // let val = 'bob'
    // const point = ptr(() => val, v => val = v)
    // const point2 = ptr(() => val, v => val = v)
    // console.log(val)
    // point.value = 'jim'
    // console.log(val)
    // point2.value = 'joe'
    // console.log(val)

    // const val2 = malloc<string>('bob')
    // console.log(val2.value)
    // const a: ptr<string>[] = []
    // a.push(val2)
    // val2.value = 'jim'
    // console.log(a[0].value)


    // SYMBOLS_ARRAY.fill(new Symbol({}))

    // Engine.addLayer({
    //   name: 'layer2',
    //   symbols: SYMBOLS_ARRAY,
    //   image: [...SURFACE_RECORDS_ARRAY, ...ARC_RECORDS_ARRAY]
    // })

    // Engine.addLayer({
    //   name: 'layer3',
    //   data: [...SURFACE_RECORDS_ARRAY]
    // })

    // Engine.addLayer({
    //   name: 'layer3',
    //   set: [...SURFACE_RECORDS_ARRAY]
    // })

    // Engine.pointer.addEventListener('pointerdown', console.log)

    setEngine(Engine)

    return () => {
      // Engine.pointer.removeEventListener('pointerdown', console.log)
      Engine.destroy()
    }

  }, [])

  return (
    <>
      {engine ?
        <>
          {/* <StatsWidget /> */}
          <Button
            onClick={(): void => { engine.layers.map(l => l.color = [Math.random(), Math.random(), Math.random()]) && engine.render(true) }}>
            Randomize Colors
          </Button>
          <br />
          Outline Mode
          <Switch
            defaultChecked={engine.SETTINGS.OUTLINE_MODE}
            onChange={(e): void => { engine.SETTINGS.OUTLINE_MODE = e.target.checked }} />
          <br />
          Zoom To Cursor
          <Switch
            defaultChecked={engine.SETTINGS.ZOOM_TO_CURSOR}
            onChange={(e): void => { engine.SETTINGS.ZOOM_TO_CURSOR = e.target.checked }} />
        </>
        : null}
      <div
        ref={containerRef}
        id="container-element"
        style={{
          width: '100%',
          height: '100%'
        }}
      >
      </div>
    </>
  )
}

function StatsWidget(): JSX.Element {
  const [fps, setFPS] = React.useState<number>(0)
  const [avgFPS, setAvgFPS] = React.useState<number>(0)

  let totalFPS = 0
  const frameTimes: number[] = []
  let frameCursor = 0
  const maxFrames = 100
  let numFrames = 0

  let then = performance.now()
  function updateFPS(now: number): void {
    now *= 0.001
    const deltaTime = now - then
    then = now
    const fps = 1 / deltaTime
    setFPS(Math.round(fps))
    totalFPS += fps - (frameTimes[frameCursor] || 0)
    frameTimes[frameCursor++] = fps
    numFrames = Math.max(numFrames, frameCursor)
    frameCursor %= maxFrames
    const avgFPS = totalFPS / numFrames
    setAvgFPS(Math.round(avgFPS))
    requestAnimationFrame(updateFPS)
  }

  React.useEffect(() => {
    requestAnimationFrame(updateFPS)
  }, [])


  return (
    <div style={{
      position: 'absolute',
      top: 0,
      right: 0,
      padding: 10,
      background: 'rgba(0,0,0,0.5)',
      color: 'white',
      fontFamily: 'monospace',
      fontSize: 12,
      pointerEvents: 'none',
      zIndex: 100,
      userSelect: 'none',
    }}>
      <div>FPS: {fps}</div>
      <div>Avg FPS: {avgFPS}</div>
    </div>
  )
}


export default REGLApp

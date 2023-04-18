import { Viewport as VirtualViewport } from '@hpcreery/pixi-viewport'
import * as PIXI from 'pixi.js'

// Apply the patch to PIXI
import '@pixi/unsafe-eval';

import * as Comlink from 'comlink'
/* eslint-disable import/no-webpack-loader-syntax */
import gerberRendererWorker from '../workers/workers?worker'
import type { WorkerMethods } from '../workers/workers'
import type { PixiGerberApplication } from '.'
import EventEmitter from 'events'

export interface OffscreenGerberApplicationProps extends OffscreenGerberPixiProps {
  element: HTMLElement
}

interface OffscreenGerberPixiProps {
  antialias?: boolean
  backgroundColor?: PIXI.ColorSource
}

export default class OffscreenGerberApplication {
  private element: HTMLElement
  private canvas: HTMLCanvasElement
  private resizeObserver: ResizeObserver
  public virtualAppliction: PIXI.Application
  public virtualViewport: VirtualViewport
  public worker: Comlink.Remote<WorkerMethods>
  public renderer: Promise<Comlink.Remote<PixiGerberApplication>>
  constructor(optionsMeta: OffscreenGerberApplicationProps) {
    // super()
    let { element, ...options } = optionsMeta
    Object.assign(options, {
      width: element.clientWidth,
      height: element.clientHeight,
    })
    this.element = element
    this.canvas = document.createElement('canvas')
    this.element.appendChild(this.canvas)
    const offscreenCanvas = this.canvas.transferControlToOffscreen()

    // Create virtual PIXI application
    this.virtualAppliction = new PIXI.Application({
      width: element.clientWidth,
      height: element.clientHeight,
      autoDensity: false,
    })

    // Create virtual viewport and add to virtual PIXI application
    // The purpose of the virtual viewport is to provide a viewport that is attached not to the DOM but to the virtual PIXI application
    // events are then passed to the real viewport
    this.virtualViewport = new VirtualViewport({
      worldWidth: 1000,
      worldHeight: 1000,
      screenWidth: element.clientWidth,
      screenHeight: element.clientHeight,
      canvasElement: this.canvas,
    })
      .drag()
      .pinch({ percent: 2 })
      .wheel()
      .decelerate()

    this.virtualAppliction.stage.addChild(this.virtualViewport)

    this.worker = Comlink.wrap<WorkerMethods>(new gerberRendererWorker())
    this.renderer = new this.worker.PixiGerberApplicationWorker(
      Comlink.transfer(offscreenCanvas, [offscreenCanvas]),
      options
    )

    // Adapt viewport to div size
    this.resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      this.virtualViewport.resize(width, height)
      this.virtualAppliction.renderer.resize(width, height)
      // this.worker.resizeViewport(width, height)
      this.renderer.then((renderer) => {
        renderer.resizeViewport(width, height)
      })
    })
    this.resizeObserver.observe(element as HTMLElement)

    // Listen to viewport events and pass them to the real viewport
    this.virtualViewport.on('moved', (e) => {
      this.moveViewport()
    })

    this.virtualViewport.on('clicked', async (e) => {
      const renderer = await this.renderer
      let intersected = await renderer.featuresAtPosition(e.screen.x, e.screen.y)
      console.log(intersected)
    })

    // this.virtualViewport.addEventListener('contextmenu', (e) => {
    //   console.log('contextmenu')
    //   if (e instanceof MouseEvent) {
    //     console.log(e.clientX, e.clientY)
    //     this.renderer.featuresAtPosition(e.clientX, e.clientY)
    //   }
    // })
  }

  public async moveViewport(): Promise<void> {
    let x = this.virtualViewport.x
    let y = this.virtualViewport.y
    let scale = this.virtualViewport.scale.x
    const renderer = await this.renderer
    await renderer.moveViewport(x, y, scale)
    // this.emit('moved', { x, y, scale })
  }

  public async zoomHome() {
    const renderer = await this.renderer
    await renderer.uncull()
    const rendererBounds = await renderer.getRendererBounds()
    const bounds = await renderer.getViewportBounds()
    if (bounds.width === 0 || bounds.height === 0) {
      return
    }
    const scale = Math.min(
      rendererBounds.width / bounds.width,
      rendererBounds.height / bounds.height
    )
    this.virtualViewport.scale = { x: scale, y: scale }
    this.virtualViewport.position = {
      x: rendererBounds.width / 2 - (bounds.x + bounds.width / 2) * scale,
      y: rendererBounds.height / 2 - (bounds.y + bounds.height / 2) * scale,
    }
    await this.moveViewport()
  }

  public async zoom(pixels: number): Promise<void> {
    this.virtualViewport.zoom(pixels, true)
    await this.moveViewport()
  }

  public async addGerber(name: string, gerber: string): Promise<void> {
    const thread = Comlink.wrap<WorkerMethods>(new gerberRendererWorker())
    const image = await thread.parseGerber(gerber)
    thread[Comlink.releaseProxy]()
    const renderer = await this.renderer
    // await renderer.addGerber(name, gerber)
    await renderer.addLayer(name, image)
    // this.emit('layerAdded', name)
  }

  public async tintLayer(name: string, color: PIXI.ColorSource): Promise<void> {
    this.renderer.then((renderer) => {
      renderer.tintLayer(name, color)
    })
  }

  public async destroy(): Promise<void> {
    this.resizeObserver.disconnect()
    this.element.removeChild(this.canvas)
    this.virtualAppliction.destroy(true)
    this.virtualViewport.removeAllListeners()
    this.virtualViewport.destroy()
    const renderer = await this.renderer
    renderer.destroy(true)
    renderer[Comlink.releaseProxy]()
    // this.removeAllListeners()
  }
}

import gdsiiPluginWorker from '@lib/gdsii?worker'
import gerberPluginWorker from '@lib/gerber?worker'
import dxfPluginWorker from '@lib/dxf?worker'
import { LayerRendererProps } from './layer'
import * as Comlink from 'comlink'

export type parser = (file: string, props: Partial<Omit<LayerRendererProps, "regl">>, addLayer: (params: Omit<LayerRendererProps, "regl">) => void) => Promise<void>


const plugins: {
  [key: string]: new () => Worker
} = {
  gdsii: gdsiiPluginWorker,
  rs274x: gerberPluginWorker,
  dxf: dxfPluginWorker,
}

export const pluginList = Object.keys(plugins)

export function registerFunction(plugin: parser): void {
  Comlink.expose(plugin)
}

export default plugins

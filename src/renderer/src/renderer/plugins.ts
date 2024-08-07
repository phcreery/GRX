import gdsiiPluginWorker from '@lib/gdsii?worker'
import gerberPluginWorker from '@lib/gerber?worker'
import dxfPluginWorker from '@lib/dxf?worker'
import ncPluginWorker from '@lib/nc?worker'
import { LayerRendererProps } from './layer'
import * as Comlink from 'comlink'
import { TMessageLevel } from './engine'

export type Plugin = (
  buffer: ArrayBuffer,
  props: Partial<Omit<LayerRendererProps, 'regl'>>,
  addLayer: (params: Omit<LayerRendererProps, 'regl'>) => void,
  addMessage?: (level: TMessageLevel, title: string, message: string) => Promise<void>
) => Promise<void>

export interface PluginsDefinition {
  [key: string]: {
    plugin: new () => Worker
    matchFile: (ext: string) => boolean
  }
}
export const plugins: PluginsDefinition = {
  rs274x: {
    plugin: gerberPluginWorker,
    matchFile: (ext) => ['gbr', 'geb', 'gerber'].includes(ext)
  },
  gdsii: {
    plugin: gdsiiPluginWorker,
    matchFile: (ext) => ['gds', 'gdsii', 'gds2'].includes(ext)
  },
  dxf: {
    plugin: dxfPluginWorker,
    matchFile: (ext) => ['dxf'].includes(ext)
  },
  nc: {
    plugin: ncPluginWorker,
    matchFile: (ext) => ['nc', 'drl', 'dr', 'rt', 'xnc'].includes(ext)
  }
}

export const defaultFormat = 'rs274x'
export const pluginList = Object.keys(plugins)

export function registerFunction(plugin: Plugin): void {
  Comlink.expose(plugin)
}

export default plugins

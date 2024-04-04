import React from 'react'
import { RenderEngine } from '@src/renderer'
import { ConfigEditorProvider } from '../contexts/ConfigEditor'
import {
  IconArrowsMove,
  IconRulerMeasure,
  IconZoomIn,
  IconZoomOut,
  IconHome,
  IconAdjustments,
  IconCube3dSphere,
  IconCube3dSphereOff,
  IconCube,
  IconGridDots,
  IconGrid4x4
} from '@tabler/icons-react'
import chroma from 'chroma-js'
import { Modal, ActionIcon, Text, Switch, Divider, Card, Group, Flex, useMantineTheme, useMantineColorScheme, ColorPicker, Tooltip, Radio } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import GeneralSettings from './toolbar/GeneralSettings'
import GridSettings from './toolbar/GridSettings'

interface ToolbarProps {
  renderEngine: RenderEngine
}

export default function Toolbar({ renderEngine }: ToolbarProps): JSX.Element | null {
  const [settingsModalOpen, { open, close }] = useDisclosure(false)
  const [gridSettingsModal, gridSettingsModalHandlers] = useDisclosure(false)
  const [outlineMode, setOutlineMode] = React.useState<boolean>(renderEngine.settings.OUTLINE_MODE)
  const [gridMode, setGridMode] = React.useState<'dots' | 'grid'>(renderEngine.grid.type)
  // const { transparency, setTransparency, primaryColor, setPrimaryColor, units, setUnits } = React.useContext(ConfigEditorProvider)
  const theme = useMantineTheme()
  const colors = useMantineColorScheme()


  return (
    <>
      <Card
        mod={['transparent']}
        withBorder
        style={{
          width: 'unset',
          height: 'unset',
          position: 'absolute',
          top: 10,
          right: 10,
          pointerEvents: 'all'
        }}
        padding={3}
      >
        <Group gap='xs'>
          <ActionIcon.Group>
            <Tooltip openDelay={500} withArrow label="Coming Soon!">
              <ActionIcon size='lg' radius="sm" disabled variant="default" onClick={(): void => { }}>
                <IconArrowsMove size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip openDelay={500} withArrow label="Coming Soon!">
              <ActionIcon size='lg' radius="sm" disabled variant="default" onClick={(): void => { }}>
                <IconRulerMeasure size={18} />
              </ActionIcon>
            </Tooltip>
          </ActionIcon.Group>
          <ActionIcon.Group>
            <Tooltip openDelay={500} withArrow label="Outline Mode">
              <ActionIcon size='lg' radius="sm" variant="default" onClick={async (): Promise<void> => {
                renderEngine.settings.OUTLINE_MODE = !outlineMode
                setOutlineMode(!outlineMode)
              }}>
                {outlineMode ? <IconCube3dSphere size={18} /> : <IconCube size={18} />}
              </ActionIcon>
            </Tooltip>
            <Tooltip openDelay={500} withArrow label="Grid Settings">
              <ActionIcon size='lg' radius="sm" variant="default" onClick={gridSettingsModalHandlers.open}>
                {/* {outlineMode ? <IconGridDots size={18} /> : <IconGrid4x4 size={18} />} */}
                <IconGrid4x4 size={18} />
              </ActionIcon>
            </Tooltip>
          </ActionIcon.Group>
          <Tooltip openDelay={500} withArrow label="Settings">
            <ActionIcon size='lg' radius="sm" variant="default" onClick={open}>
              <IconAdjustments size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Card>
      <Modal title="Settings" opened={settingsModalOpen} onClose={close}>
        <GeneralSettings renderEngine={renderEngine} />
      </Modal>
      <Modal title="Grid Settings" opened={gridSettingsModal} onClose={gridSettingsModalHandlers.close}>
        <GridSettings renderEngine={renderEngine} />
      </Modal>
    </>
  )
}

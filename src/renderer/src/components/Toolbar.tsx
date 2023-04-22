import React from 'react'
import {
  DragOutlined,
  HomeOutlined,
  LineOutlined,
  ToolOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons'
import { Button, Card, Divider, Modal, Segmented, Space, Switch, theme, Typography } from 'antd'
import chroma from 'chroma-js'
import VirtualGerberApplication from '../renderer/virtual'
import { ConfigEditorProvider } from '../contexts/ConfigEditor'
const { useToken } = theme
const { Text } = Typography

interface ToolbarProps {
  gerberApp: VirtualGerberApplication
}

export default function Toolbar({ gerberApp }: ToolbarProps) {
  const { token } = useToken()
  const [settingsModalOpen, settingsSetModalOpen] = React.useState<boolean>(false)
  const {
    themeState,
    setThemeState,
    transparency,
    setTransparency,
    blur,
    componentSize,
    setComponentSize
  } = React.useContext(ConfigEditorProvider)

  const showModal = () => {
    settingsSetModalOpen(true)
  }

  const handleSettingsModalOk = () => {
    settingsSetModalOpen(false)
  }

  const handleSettingsModalCancel = () => {
    settingsSetModalOpen(false)
  }

  return (
    <>
      <Card
        style={{
          width: 'unset',
          height: 'unset',
          position: 'absolute',
          top: 10,
          right: 10,
          backgroundColor: transparency
            ? chroma(token.colorBgElevated).alpha(0.7).css()
            : chroma(token.colorBgElevated).css(),
          backdropFilter: transparency ? `blur(${blur}px)` : '',
          pointerEvents: 'all'
        }}
        bodyStyle={{ padding: 3 }}
      >
        <Space size={1}>
          {/* <Button icon={<DragOutlined />} type='text' /> */}
          {/* <Button icon={<LineOutlined />} type='text' /> */}
          <Segmented
            size={componentSize}
            style={{
              backgroundColor: transparency
                ? chroma(token.colorBgLayout).alpha(0.3).css()
                : chroma(token.colorBgLayout).alpha(0.3).css(),
              backdropFilter: transparency ? '' : ''
            }}
            options={[
              {
                label: '',
                value: 'Move',
                icon: <DragOutlined />
              },
              {
                label: '',
                value: 'Measure',
                icon: <LineOutlined />
              }
            ]}
          />
          <Divider type="vertical" style={{ margin: '0 3px' }} />
          <Button
            icon={<ZoomInOutlined />}
            onClick={() => {
              gerberApp.zoom(-550 / gerberApp.virtualViewport.scale.x)
            }}
            type="text"
          />
          <Button
            icon={<ZoomOutOutlined />}
            onClick={async () => {
              gerberApp.zoom(1000 / gerberApp.virtualViewport.scale.x)
            }}
            type="text"
          />
          <Button
            icon={<HomeOutlined />}
            onClick={() => {
              gerberApp.zoomHome()
              gerberApp.virtualViewport.decelerate()
            }}
            type="text"
          />
          <Divider type="vertical" style={{ margin: '0 3px' }} />
          <Button icon={<ToolOutlined />} onClick={() => showModal()} type="text" />
          {/* <Button icon={<FullscreenOutlined />} type='text' /> */}
          {/* <Button icon={<CloudDownloadOutlined />} type='text' /> */}
          {/* <Button icon={<SearchOutlined />} type='text' /> */}
        </Space>
      </Card>
      <Modal
        title="Settings"
        open={settingsModalOpen}
        onOk={handleSettingsModalOk}
        onCancel={handleSettingsModalCancel}
      >
        <Divider />
        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text>Size</Text>
          <Segmented
            size={componentSize}
            value={componentSize}
            options={[
              {
                label: 'Small',
                value: 'small'
              },
              {
                label: 'Middle',
                value: 'middle'
              },
              {
                label: 'Large',
                value: 'large'
              }
            ]}
            onChange={(value) => {
              setComponentSize(value as 'small' | 'middle' | 'large')
            }}
          />
        </Space>
        <Divider />
        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text>Dark Mode</Text>
          <Switch
            defaultChecked={themeState.algorithm === theme.darkAlgorithm}
            onChange={(checked) => {
              if (checked) {
                setThemeState({ algorithm: theme.darkAlgorithm })
              } else {
                setThemeState({ algorithm: theme.defaultAlgorithm })
              }
            }}
          />
        </Space>
        <Divider />
        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text>Transparency</Text>
          <Switch
            defaultChecked={transparency}
            onChange={(checked) => {
              setTransparency(checked)
            }}
          />
        </Space>
        <Divider />
      </Modal>
    </>
  )
}

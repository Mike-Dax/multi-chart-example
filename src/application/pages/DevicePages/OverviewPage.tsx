import { Card, Colors } from '@blueprintjs/core'
import { IntervalRequester } from '@electricui/components-core'
import { Slider } from '@electricui/components-desktop-blueprint'
import { Legend } from '@electricui/components-desktop-blueprint-timeseries'
import {
  ChartContainer,
  LineChart,
  RealTimeDomain,
  TimeAxis,
  VerticalAxis,
  useLegend,
} from '@electricui/components-desktop-charts'
import { useMessageDataSource } from '@electricui/core-timeseries'

import { RouteComponentProps } from '@reach/router'
import React from 'react'

export const OverviewPage = (props: RouteComponentProps) => {
  const heartbeatDataSource = useMessageDataSource<
    {
      state: number
      velocity: number
      position: number
      current: number
    }[]
  >('axis_heartbeat')

  const legendDefinition = useLegend({
    axis0: {
      name: 'Axis 0',
      color: Colors.RED5,
    },
    axis1: {
      name: 'Axis 1',
      color: Colors.ORANGE5,
    },
    axis2: {
      name: 'Axis 2',
      color: Colors.GOLD5,
    },
    axis3: {
      name: 'Axis 3',
      color: Colors.BLUE5,
    },
    axis4: {
      name: 'Axis 4',
      color: Colors.TURQUOISE5,
    },
    axis5: {
      name: 'Axis 5',
      color: Colors.ROSE5,
    },
  })

  return (
    <React.Fragment>
      {/* Request these messageIDs every 50ms */}
      <IntervalRequester interval={50} messageIDs={['led_state']} />

      {/* Two column grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1em',
        }}
      >
        {/* First column card */}
        <Card>
          <div style={{ textAlign: 'center', marginBottom: '1em' }}>
            <b>Velocity</b>
          </div>
          <Legend data={legendDefinition} justifyContent="right" />

          <ChartContainer>
            {/* Enumerate each index of the legend definition, they're in order so the indexes match the heartbeat
                data source */}
            {Object.entries(legendDefinition).map(([key, def], index) => (
              <LineChart
                key={key}
                dataSource={heartbeatDataSource}
                accessor={(data, time, tags) => data[index].velocity}
                color={def.color}
                opacitySource={def.opacity}
                visibilitySource={def.visible}
              />
            ))}

            {/* 30 second realtime window */}
            <RealTimeDomain window={30_000} />
            <TimeAxis />
            <VerticalAxis />
          </ChartContainer>
        </Card>

        {/* Second column card */}
        <Card>
          <div style={{ textAlign: 'center', marginBottom: '1em' }}>
            <b>Current</b>
          </div>
          <Legend data={legendDefinition} justifyContent="right" />

          <ChartContainer>
            {Object.entries(legendDefinition).map(([key, def], index) => (
              <LineChart
                key={key}
                dataSource={heartbeatDataSource}
                accessor={(data, time, tags) => data[index].current}
                color={def.color}
                opacitySource={def.opacity}
                visibilitySource={def.visible}
              />
            ))}
            <RealTimeDomain window={10000} />
            <TimeAxis />
            <VerticalAxis />
          </ChartContainer>
        </Card>
      </div>

      {/* Full length Card */}
      <Card style={{ marginTop: '1em' }}>
        <p>Velocity override:</p>
        <Slider min={0} max={255} stepSize={1} labelStepSize={25}>
          <Slider.Handle accessor="VelOverride" />
        </Slider>

        <p>Accel override:</p>
        <Slider min={0} max={255} stepSize={1} labelStepSize={25}>
          <Slider.Handle accessor="VelOverride" />
        </Slider>
      </Card>
    </React.Fragment>
  )
}

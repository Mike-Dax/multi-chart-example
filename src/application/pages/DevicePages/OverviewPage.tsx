import { Card, Colors, Intent, Tag } from '@blueprintjs/core'
import {
  IntervalRequester,
  useHardwareState,
} from '@electricui/components-core'
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
          // Draw a grid...
          display: 'grid', // ...with two equally sized columns
          gridTemplateColumns: '1fr 1fr',
          // and a 1em gap between each item
          gap: '1em',
          // plus a 1em margin on the bottom to separate these cards from the center card
          marginTop: '1em',
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
      <Card
        style={{
          // Draw a grid...
          display: 'grid', // ...where the right uses the minimum space required
          gridTemplateColumns: '1fr min-content',
          // Gap of 1em between the columns
          gap: '1em',
        }}
      >
        {/* Left */}
        <div>
          <p>Velocity override:</p>
          <Slider min={0} max={255} stepSize={1} labelStepSize={25}>
            <Slider.Handle accessor="VelOverride" />
          </Slider>

          <p>Accel override:</p>
          <Slider min={0} max={255} stepSize={1} labelStepSize={25}>
            <Slider.Handle accessor="VelOverride" />
          </Slider>
        </div>

        {/* Right */}
        <div
          style={{
            display: 'flex', // Draw a flexbox region..
            flexDirection: 'column', // ...as a column
            gap: 5, // With 5px gap between each item
          }}
        >
          {/* For each axis (in the legend) */}
          {Object.entries(legendDefinition).map(([key, def], index) => (
            // Render the status component.
            // The key is a React concept to know which list item is which
            // The axis is the index 0 - 5
            <Status key={key} axis={index} />
          ))}
        </div>
      </Card>
    </React.Fragment>
  )
}

function Status(props: { axis: number }) {
  // These type annotations are local to the useHardwareState hook
  // They can be made global via the typed state file:
  // https://electricui.com/docs/interface/typed-state
  // But for a quick demo or a small project, this is fine.
  // It just guards against accidental errors.
  const struct = useHardwareState<{
    state: number
    velocity: number
    position: number
    current: number
  }>(state => state['axis_heartbeat']?.[props.axis])
  // I'm using nullish coalescence here (the ?. between the struct accessors),
  // in case the firmware changes and this data becomes invalid. Instead of
  // throwing a hard error, it will become 'undefined' and that will trickle through
  // to the switch case, where it will be treated as -1, and the default fall through
  // will be triggered, displaying 'unknown'.

  let label = 'UNKNOWN'
  let intent: Intent = Intent.NONE

  // If struct.state is null, the switch statement treats it as -1
  switch (struct?.state ?? -1) {
    // If the state is the number 1.
    case 1:
      label = 'READY'
      intent = Intent.PRIMARY
      break
    case 2:
      label = 'ERROR'
      intent = Intent.DANGER
      break
    case 3:
      label = 'HOMING'
      intent = Intent.WARNING
      break

    // Fall through case, could omit this, since
    // we're defining the label and intent defaults in the upper scope anyway,
    // this is just being defensive.
    case 0:
    default:
      label = 'UNKNOWN'
      intent = Intent.NONE
      break
  }

  // Render the Tag, with some text formatting
  return (
    <Tag intent={intent}>
      Axis #{props.axis} {label}
    </Tag>
  )
}

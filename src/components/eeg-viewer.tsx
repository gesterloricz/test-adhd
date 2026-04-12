import { useMemo, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Activity, Loader2 } from 'lucide-react'

const EEG_CHANNELS = [
  "Fp1", "Fp2", "F3", "F4", "F7", "F8", "Fz",
  "C3", "C4", "Cz", "T3", "T4",
  "P3", "P4", "Pz", "T5", "T6",
  "O1", "O2",
]

const WAVEFORM_COLOR = "#2a9d8f"  // Teal color matching the image
const GRID_COLOR = "#e0e0e0"
const SCALE_FACTOR = 3.5  // Vertical spacing between channels (reduced for compact view)

interface EEGViewerProps {
  eegData: number[][]  // Shape: [channels, samples]
  samplingRate?: number
  downsample?: number  // Factor to downsample for performance
  fileName?: string
}

export default function EEGViewer({
  eegData,
  samplingRate = 128,
  downsample = 4,
  fileName,
}: EEGViewerProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Defer rendering to next frame to prevent UI blocking
    const timer = setTimeout(() => setIsLoading(false), 0)
    return () => clearTimeout(timer)
  }, [eegData])

  // Validate data
  if (!eegData || eegData.length === 0 || eegData[0].length === 0) {
    return (
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-6 text-center text-muted-foreground">
          No EEG data available
        </CardContent>
      </Card>
    )
  }

  const numChannels = eegData.length
  const numSamples = eegData[0].length
  const duration = numSamples / samplingRate

  // Normalize each channel (z-score like the Python script)
  const normalizedData = useMemo(() => {
    return eegData.map(channel => {
      const mean = channel.reduce((a, b) => a + b, 0) / channel.length
      const std = Math.sqrt(channel.reduce((a, b) => a + (b - mean) ** 2, 0) / channel.length)
      if (std > 0) {
        return channel.map(val => (val - mean) / std)
      }
      return channel.map(val => val - mean)
    })
  }, [eegData])

  // SVG dimensions - made more compact and responsive to zoom
  const labelWidth = 35
  const chartMargin = { top: 25, right: 20, bottom: 50, left: labelWidth }
  const baseChartWidth = 750
  const chartWidth = baseChartWidth
  const chartHeight = numChannels * SCALE_FACTOR * 10  // Dynamic height based on channels
  const svgWidth = chartWidth + chartMargin.left + chartMargin.right
  const svgHeight = chartHeight + chartMargin.top + chartMargin.bottom

  // Time axis - smart intervals similar to Python script
  const getTimeIntervals = () => {
    const targets = [1, 2, 5, 10, 15, 20, 30, 60, 100, 120, 150, 200, 300, 500, 600, 1000, 1200, 1800, 3600]
    const best = targets.reduce((prev, curr) =>
      Math.abs(duration / curr - 15) < Math.abs(duration / prev - 15) ? curr : prev
    )
    return best
  }

  const majorInterval = getTimeIntervals()
  const timePoints = []
  for (let t = 0; t <= duration; t += majorInterval) {
    timePoints.push(t)
  }

  // Render SVG waveforms
  const renderWaveforms = () => {
    const paths = []
    const waveWidth = chartWidth

    for (let chIdx = 0; chIdx < normalizedData.length; chIdx++) {
      const channel = normalizedData[chIdx]
      const yOffset = chartMargin.top + chIdx * SCALE_FACTOR * 10

      // Create path data
      let pathData = ''
      for (let i = 0; i < channel.length; i += downsample) {
        const x = chartMargin.left + (i / numSamples) * waveWidth
        const y = yOffset - channel[i] * 3  // Scale amplitude
        if (i === 0) {
          pathData += `M ${x} ${y}`
        } else {
          pathData += ` L ${x} ${y}`
        }
      }

      paths.push(
        <path
          key={`waveform-${chIdx}`}
          d={pathData}
          stroke={WAVEFORM_COLOR}
          strokeWidth="0.6"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      )
    }

    return paths
  }

  // Render channel labels
  const renderChannelLabels = () => {
    return EEG_CHANNELS.map((name, idx) => (
      <text
        key={`label-${idx}`}
        x={chartMargin.left - 8}
        y={chartMargin.top + idx * SCALE_FACTOR * 10 + 4}
        textAnchor="end"
        fontSize="10"
        fontFamily="monospace"
        fill="#666"
      >
        {name}
      </text>
    ))
  }

  // Render time axis
  const renderTimeAxis = () => {
    const elements = []
    const yPos = chartMargin.top + chartHeight

    timePoints.forEach(time => {
      const x = chartMargin.left + (time / duration) * chartWidth

      // Major tick
      elements.push(
        <line
          key={`tick-${time}`}
          x1={x}
          y1={yPos}
          x2={x}
          y2={yPos + 5}
          stroke="#999"
          strokeWidth="1"
        />
      )

      // Label
      elements.push(
        <text
          key={`label-${time}`}
          x={x}
          y={yPos + 20}
          textAnchor="middle"
          fontSize="11"
          fill="#666"
        >
          {time === Math.floor(time) ? Math.floor(time) : time.toFixed(1)}
        </text>
      )
    })

    // Axis line
    elements.push(
      <line
        key="x-axis"
        x1={chartMargin.left}
        y1={yPos}
        x2={chartMargin.left + chartWidth}
        y2={yPos}
        stroke="#666"
        strokeWidth="1"
      />
    )

    // Y-axis line
    elements.push(
      <line
        key="y-axis"
        x1={chartMargin.left}
        y1={chartMargin.top}
        x2={chartMargin.left}
        y2={yPos}
        stroke="#666"
        strokeWidth="1"
      />
    )

    return elements
  }

  // Render grid lines
  const renderGrid = () => {
    const elements = []

    // Vertical grid lines at time intervals
    timePoints.forEach(time => {
      const x = chartMargin.left + (time / duration) * chartWidth
      elements.push(
        <line
          key={`vgrid-${time}`}
          x1={x}
          y1={chartMargin.top}
          x2={x}
          y2={chartMargin.top + chartHeight}
          stroke={GRID_COLOR}
          strokeWidth="0.5"
          strokeDasharray="3,3"
          vectorEffect="non-scaling-stroke"
        />
      )
    })

    // Horizontal grid lines for channels
    for (let chIdx = 0; chIdx < numChannels; chIdx++) {
      const y = chartMargin.top + chIdx * SCALE_FACTOR * 10
      elements.push(
        <line
          key={`hgrid-${chIdx}`}
          x1={chartMargin.left}
          y1={y}
          x2={chartMargin.left + chartWidth}
          y2={y}
          stroke={GRID_COLOR}
          strokeWidth="0.3"
          vectorEffect="non-scaling-stroke"
        />
      )
    }

    return elements
  }

  return (
    <div className="w-full">
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="py-2 px-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-md">{fileName && ` ${fileName}`}</CardTitle>
                <CardDescription className="text-xs">
                  Duration: {duration.toFixed(1)}s ({(duration / 60).toFixed(2)} min) • {samplingRate}Hz • BP 0.5-50 Hz
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="overflow-x-auto p-2 w-full">
          {/* SVG Waveform Display */}
          <div className="bg-white rounded  w-full flex items-center justify-center" style={{ minHeight: `${Math.max(300, svgHeight * 0.6)}px` }}>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading waveform...</p>
              </div>
            ) : (
              <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                preserveAspectRatio="xMidYMid meet"
                style={{ backgroundColor: 'white', overflow: 'visible', display: 'block' }}
              >
                {/* Grid */}
                {renderGrid()}

                {/* Waveforms */}
                {renderWaveforms()}

                {/* Channel Labels */}
                {renderChannelLabels()}

                {/* Axes */}
                {renderTimeAxis()}

                {/* Time label */}
                <text
                  x={chartMargin.left + chartWidth / 2}
                  y={svgHeight - 5}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#333"
                >
                  Time (s)
                </text>
              </svg>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

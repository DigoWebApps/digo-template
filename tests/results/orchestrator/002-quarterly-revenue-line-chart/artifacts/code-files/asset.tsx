import React from 'react';
import { DigoAsset } from '@digo-org/digo-api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export class Asset extends DigoAsset {
  constructor() {
    super();
  }

  render() {
    // Access global parameters
    const backgroundColor = this.globalParameters['background-color'] as string;
    const chartWidth = this.globalParameters['chart-width'] as number;
    const chartHeight = this.globalParameters['chart-height'] as number;
    const lineColor = this.globalParameters['line-color'] as string;
    const strokeWidth = this.globalParameters['stroke-width'] as number;
    const showGrid = this.globalParameters['show-grid'] as boolean;
    const showXAxis = this.globalParameters['show-x-axis'] as boolean;
    const showYAxis = this.globalParameters['show-y-axis'] as boolean;
    const xAxisLabel = this.globalParameters['x-axis-label'] as string;
    const yAxisLabel = this.globalParameters['y-axis-label'] as string;
    const chartTitle = this.globalParameters['chart-title'] as string;
    const smoothCurve = this.globalParameters['smooth-curve'] as boolean;
    const showDots = this.globalParameters['show-dots'] as boolean;
    const marginTop = this.globalParameters['margin-top'] as number;
    const marginRight = this.globalParameters['margin-right'] as number;
    const marginBottom = this.globalParameters['margin-bottom'] as number;
    const marginLeft = this.globalParameters['margin-left'] as number;

    // Transform instance data for Recharts
    const chartData = this.instances?.map((instance, index) => ({
      ...instance,
      name: instance['line-label'] as string || `Point ${index + 1}`,
      value: instance['line-value'] as number || 0
    })) || [];

    return (
      <div style={{ width: '100%', height: '100%', backgroundColor, padding: '20px' }}>
        {chartTitle && (
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
            {chartTitle}
          </h2>
        )}
        <ResponsiveContainer width={chartWidth} height={chartHeight}>
          <LineChart
            data={chartData}
            margin={{ top: marginTop, right: marginRight, bottom: marginBottom, left: marginLeft }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            {showXAxis && <XAxis dataKey="name" label={{ value: xAxisLabel, position: 'insideBottom', offset: -5 }} />}
            {showYAxis && <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />}
            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
            <Legend />
            <Line
              type={smoothCurve ? 'monotone' : 'linear'}
              dataKey="value"
              stroke={lineColor}
              strokeWidth={strokeWidth}
              dot={showDots}
              name="Revenue"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

import { DigoAsset } from '@digo-org/digo-api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';

export class Asset extends DigoAsset {
  constructor() {
    super();
  }

  override render() {
    const chartData = this.instances?.map((instance, index) => ({
      ...instance,
      name: instance['bar-label'] || `Item ${index + 1}`,
      value: instance['bar-value']
    })) || [];

    return (
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: this.globalParameters['background-color'] as string || '#ffffff',
        padding: (this.globalParameters['chart-padding'] as number || 20) + 'px',
        fontFamily: 'sans-serif',
        boxSizing: 'border-box'
      }}>
        {this.globalParameters['show-title'] && (
          <h2 style={{
            textAlign: 'center',
            margin: '0 0 20px 0',
            fontSize: '24px',
            color: '#1f2937',
            fontWeight: 'bold',
          }}>
            {this.globalParameters['chart-title'] as string || 'Bar Chart'}
          </h2>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            {this.globalParameters['show-grid'] && (
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            )}

            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />

            {this.globalParameters['show-tooltip'] && (
              <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
            )}

            <Bar
              dataKey="value"
              radius={[
                this.globalParameters['bar-radius'] as number || 4,
                this.globalParameters['bar-radius'] as number || 4,
                0,
                0
              ]}
              animationDuration={200}
              animationEasing={'ease-in-out'}
            >
              {chartData.map((instance, index) => {
                const fillColor = instance['bar-color'] as string || '#3b82f6';
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={fillColor}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

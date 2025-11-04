import React from 'react';
import { VisualizationData, BarChartData, FlowDiagramData } from '../types';
import { ArrowIcon } from './IconComponents';

interface DataVisualizerProps {
  data: VisualizationData;
}

const BarChart: React.FC<{ chartData: BarChartData }> = ({ chartData }) => {
  const maxValue = Math.max(...chartData.data.map(d => d.value), 0);
  const scale = maxValue > 0 ? 100 / maxValue : 0;

  return (
    <div className="my-4 p-4 bg-slate-200 rounded-lg border-2 border-black">
      <h3 className="text-md font-bold text-center mb-4 text-slate-800">{chartData.title}</h3>
      <div className="flex items-end justify-around h-40 gap-4">
        {chartData.data.map((item, index) => (
          <div key={index} className="flex flex-col items-center h-full w-full">
            <div 
              className="w-full rounded-t-md transition-all duration-500"
              style={{ 
                height: `${item.value * scale}%`,
                backgroundColor: item.color || '#a78bfa'
              }}
              title={`${item.label}: ${item.value}`}
            />
            <span className="text-xs font-semibold mt-2 text-slate-700 truncate">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const FlowDiagram: React.FC<{ diagramData: FlowDiagramData }> = ({ diagramData }) => {
  return (
    <div className="my-4 p-4 bg-slate-200 rounded-lg border-2 border-black">
      <h3 className="text-md font-bold text-center mb-4 text-slate-800">{diagramData.title}</h3>
      <div className="flex items-center justify-center flex-wrap gap-2">
        {diagramData.steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="bg-white text-slate-800 rounded-lg p-2 text-sm font-semibold border-2 border-black shadow-md">
              {step}
            </div>
            {index < diagramData.steps.length - 1 && (
              <ArrowIcon className="w-6 h-6 text-slate-600 flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};


const DataVisualizer: React.FC<DataVisualizerProps> = ({ data }) => {
  switch (data.type) {
    case 'barChart':
      return <BarChart chartData={data} />;
    case 'flowDiagram':
      return <FlowDiagram diagramData={data} />;
    default:
      return null;
  }
};

export default DataVisualizer;

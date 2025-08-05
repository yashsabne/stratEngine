import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const DataVisualization = ({ data }) => {
  const {
    salesTrend = [],
    productPerformance = [],
    seasonalTrends = [],
    salesDistribution = [],
  } = data;

  return (
    <div className="mt-6 bg-gray-900 rounded-lg p-6">
      <h4 className="text-sm font-semibold text-gray-200 mb-4">Data Visualization</h4>

      {/* Sales Trend Graph */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={salesTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="month" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Line type="monotone" dataKey="price" stroke="#00C49F" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Product Performance & Seasonal Trend */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Product Performance */}
        <div className="h-60 bg-gray-800 rounded-lg p-3">
          <h5 className="text-sm text-gray-400 mb-2">Product Performance</h5>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="product" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Bar dataKey="units" fill="#FFBB28" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Seasonal Trends */}
        <div className="h-60 bg-gray-800 rounded-lg p-3">
          <h5 className="text-sm text-gray-400 mb-2">Seasonal Trends</h5>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart outerRadius={90} data={seasonalTrends}>
              <PolarGrid />
              <PolarAngleAxis dataKey="month" stroke="#ccc" />
              <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} stroke="#555" />
              <Radar name="Sales" dataKey="sales" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sales Distribution */}
      <div className="mt-4 h-64 bg-gray-800 rounded-lg p-3">
        <h5 className="text-sm text-gray-400 mb-2">Sales Distribution</h5>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={salesDistribution}
              dataKey="value"
              nameKey="category"
              outerRadius={80}
              label
            >
              {salesDistribution.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DataVisualization;

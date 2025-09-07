'use client';

import { 
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface ProgressChartProps {
  data: Array<{
    month: string;
    revenue: number;
    orders: number;
    buyers: number;
  }>;
}

interface MarketChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export function ProgressChart({ data }: ProgressChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="revenue" stroke="#2C7BE5" strokeWidth={3} name="Revenue (₹M)" />
        <Line type="monotone" dataKey="orders" stroke="#7C3AED" strokeWidth={2} name="Orders" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function MarketChart({ data }: MarketChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

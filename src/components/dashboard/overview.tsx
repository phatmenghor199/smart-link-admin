"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

const data = [
  { month: "Jan", users: 400, revenue: 24000 },
  { month: "Feb", users: 500, revenue: 32000 },
  { month: "Mar", users: 600, revenue: 39000 },
  { month: "Apr", users: 800, revenue: 48000 },
  { month: "May", users: 1000, revenue: 61000 },
  { month: "Jun", users: 1200, revenue: 74000 },
  { month: "Jul", users: 1300, revenue: 78000 },
  { month: "Aug", users: 1400, revenue: 82000 },
  { month: "Sep", users: 1500, revenue: 91000 },
  { month: "Oct", users: 1700, revenue: 102000 },
  { month: "Nov", users: 1900, revenue: 115000 },
  { month: "Dec", users: 2000, revenue: 125000 },
];

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string> & { payload?: { value: number }[] }) => {
  if (active && payload && payload.length) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="p-2">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-blue-500">
            Users: {payload[0].value.toLocaleString()}
          </p>
          <p className="text-sm text-green-500">
            Revenue: ${payload[1].value.toLocaleString()}
          </p>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export function Overview() {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="users"
            stackId="1"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.2}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stackId="1"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

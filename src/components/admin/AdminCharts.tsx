"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

interface AdminChartsProps {
  registrationData: Array<{ date: string; count: number }>;
  roleData: Array<{ name: string; value: number }>;
}

const ROLE_COLORS = ["#2d6a4f", "#52b788", "#d8f3dc"];

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "var(--color-white)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          padding: "8px 12px",
          boxShadow: "var(--shadow-md)",
          fontSize: "0.8125rem",
        }}
      >
        <p style={{ color: "var(--color-text-muted)", marginBottom: 4 }}>{label}</p>
        <p style={{ fontWeight: 600, color: "var(--color-accent)" }}>
          {payload[0].value} registrations
        </p>
      </div>
    );
  }
  return null;
};

export function AdminCharts({ registrationData, roleData }: AdminChartsProps) {
  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}
      className="charts-grid"
    >
      <Card>
        <CardHeader>
          <CardTitle>User Registrations (Last 30 days)</CardTitle>
        </CardHeader>
        {registrationData.length === 0 ? (
          <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
            No registration data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={registrationData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                axisLine={false}
                tickLine={false}
                interval={Math.floor(registrationData.length / 5)}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#2d6a4f"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: "#2d6a4f", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users by Role</CardTitle>
        </CardHeader>
        {roleData.every((r) => r.value === 0) ? (
          <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
            No data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={roleData}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {roleData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={ROLE_COLORS[index % ROLE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--color-white)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.8125rem",
                  boxShadow: "var(--shadow-md)",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}
                iconType="circle"
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Card>

      <style>{`
        @media (max-width: 768px) {
          .charts-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, PieChart, TrendingUp, Target } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  LineChart,
  Line,
  Pie,
} from "recharts"

interface ChartGeneratorProps {
  type: string
  title: string
  data: any[]
}

export function ChartGenerator({ type, title, data }: ChartGeneratorProps) {
  const [selectedChart, setSelectedChart] = useState(type)

  const COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6", "#f97316"]

  const renderChart = () => {
    switch (selectedChart) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {data[0]?.people !== undefined ? (
                <>
                  <Bar dataKey="people" fill="#10b981" name="People" />
                  <Bar dataKey="strategy" fill="#f59e0b" name="Strategy" />
                  <Bar dataKey="execution" fill="#3b82f6" name="Execution" />
                  <Bar dataKey="cash" fill="#ef4444" name="Cash" />
                </>
              ) : (
                <Bar dataKey="value" fill="#f59e0b" />
              )}
            </BarChart>
          </ResponsiveContainer>
        )

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Tooltip />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </RechartsPieChart>
          </ResponsiveContainer>
        )

      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {data[0]?.projected !== undefined ? (
                <>
                  <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={3} name="Actual" />
                  <Line
                    type="monotone"
                    dataKey="projected"
                    stroke="#10b981"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    name="Proyectado"
                  />
                </>
              ) : (
                <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={3} />
              )}
            </LineChart>
          </ResponsiveContainer>
        )

      case "progress":
        return (
          <div className="space-y-4 p-4">
            {data.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm text-gray-600">
                    {item.inverse
                      ? `${item.current} días (meta: ${item.target})`
                      : `${item.current}% (meta: ${item.target}%)`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${item.inverse ? Math.max(0, 100 - (item.current / item.target) * 100) : (item.current / item.target) * 100}%`,
                      backgroundColor: item.color || "#f59e0b",
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="p-4 border-amber-200 bg-amber-50">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-amber-600" />
        <h4 className="font-semibold text-amber-800">{title}</h4>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <Button
          size="sm"
          variant={selectedChart === "bar" ? "default" : "outline"}
          onClick={() => setSelectedChart("bar")}
          className="text-xs"
        >
          <BarChart3 className="w-3 h-3 mr-1" />
          Barras
        </Button>
        <Button
          size="sm"
          variant={selectedChart === "pie" ? "default" : "outline"}
          onClick={() => setSelectedChart("pie")}
          className="text-xs"
        >
          <PieChart className="w-3 h-3 mr-1" />
          Circular
        </Button>
        <Button
          size="sm"
          variant={selectedChart === "line" ? "default" : "outline"}
          onClick={() => setSelectedChart("line")}
          className="text-xs"
        >
          <TrendingUp className="w-3 h-3 mr-1" />
          Línea
        </Button>
        <Button
          size="sm"
          variant={selectedChart === "progress" ? "default" : "outline"}
          onClick={() => setSelectedChart("progress")}
          className="text-xs"
        >
          <Target className="w-3 h-3 mr-1" />
          Progreso
        </Button>
      </div>

      <div className="bg-white rounded-lg p-2">{renderChart()}</div>
    </Card>
  )
}

"use client";

import ReactECharts from "echarts-for-react";
import type { AdminStats } from "@/lib/adminApi";

const COUNTRY_LABELS: Record<string, string> = {
  general: "Autre",
  senegal: "Sénégal",
  mali: "Mali",
  benin: "Bénin",
  togo: "Togo",
  cote_ivoire: "Côte d'Ivoire",
  cameroun: "Cameroun",
  guinea: "Guinée",
  burkina: "Burkina Faso",
  niger: "Niger",
  congo: "Congo",
  gabon: "Gabon",
};

// Fills missing dates in a 30-day range with count = 0
function fillDates(data: { date: string; count: number }[]): { date: string; count: number }[] {
  const map = new Map(data.map((d) => [d.date, d.count]));
  const result: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, count: map.get(key) ?? 0 });
  }
  return result;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

interface Props {
  stats: AdminStats;
}

export function UsersChart({ stats }: Props) {
  const filled = fillDates(stats.usersOverTime);
  const option = {
    tooltip: { trigger: "axis" },
    grid: { left: 40, right: 16, top: 16, bottom: 40 },
    xAxis: {
      type: "category",
      data: filled.map((d) => formatDate(d.date)),
      axisLabel: { fontSize: 10, interval: 4 },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: "#e5e7eb" } },
    },
    yAxis: {
      type: "value",
      minInterval: 1,
      axisLabel: { fontSize: 10 },
      splitLine: { lineStyle: { color: "#f3f4f6" } },
    },
    series: [
      {
        name: "Inscriptions",
        type: "line",
        data: filled.map((d) => d.count),
        smooth: true,
        symbol: "circle",
        symbolSize: 5,
        lineStyle: { color: "#3b82f6", width: 2 },
        itemStyle: { color: "#3b82f6" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(59,130,246,0.2)" },
              { offset: 1, color: "rgba(59,130,246,0)" },
            ],
          },
        },
      },
    ],
  };
  return <ReactECharts option={option} style={{ height: 200 }} />;
}

export function MenusChart({ stats }: Props) {
  const filled = fillDates(stats.menusOverTime);
  const option = {
    tooltip: { trigger: "axis" },
    grid: { left: 40, right: 16, top: 16, bottom: 40 },
    xAxis: {
      type: "category",
      data: filled.map((d) => formatDate(d.date)),
      axisLabel: { fontSize: 10, interval: 4 },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: "#e5e7eb" } },
    },
    yAxis: {
      type: "value",
      minInterval: 1,
      axisLabel: { fontSize: 10 },
      splitLine: { lineStyle: { color: "#f3f4f6" } },
    },
    series: [
      {
        name: "Menus générés",
        type: "line",
        data: filled.map((d) => d.count),
        smooth: true,
        symbol: "circle",
        symbolSize: 5,
        lineStyle: { color: "#8b5cf6", width: 2 },
        itemStyle: { color: "#8b5cf6" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(139,92,246,0.2)" },
              { offset: 1, color: "rgba(139,92,246,0)" },
            ],
          },
        },
      },
    ],
  };
  return <ReactECharts option={option} style={{ height: 200 }} />;
}

export function CountryChart({ stats }: Props) {
  const sorted = [...stats.usersByCountry].sort((a, b) => b.count - a.count).slice(0, 8);
  const option = {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: 90, right: 16, top: 16, bottom: 24 },
    xAxis: {
      type: "value",
      minInterval: 1,
      axisLabel: { fontSize: 10 },
      splitLine: { lineStyle: { color: "#f3f4f6" } },
    },
    yAxis: {
      type: "category",
      data: sorted.map((d) => COUNTRY_LABELS[d.country] ?? d.country),
      axisLabel: { fontSize: 11 },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: "#e5e7eb" } },
    },
    series: [
      {
        name: "Utilisateurs",
        type: "bar",
        data: sorted.map((d) => d.count),
        barMaxWidth: 24,
        itemStyle: {
          color: "#10b981",
          borderRadius: [0, 4, 4, 0],
        },
        label: { show: true, position: "right", fontSize: 11 },
      },
    ],
  };
  return <ReactECharts option={option} style={{ height: Math.max(180, sorted.length * 36) }} />;
}

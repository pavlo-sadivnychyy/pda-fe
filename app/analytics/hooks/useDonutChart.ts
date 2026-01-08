import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

type DonutTotals = {
  paid: number;
  outstanding: number;
  overdue: number;
};

export const useDonutChart = (params: {
  totals: DonutTotals;
  currency: string;
}) => {
  const { totals, currency } = params;

  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // init once
  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Отримано", "Очікується", "Прострочено"],
        datasets: [
          {
            data: [0, 0, 0],
            backgroundColor: ["#16a34a", "#facc15", "#b91c1c"],
            borderColor: "#ffffff",
            borderWidth: 4,
          },
        ],
      },
      options: {
        cutout: "70%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#4b5563",
              font: { size: 12 },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = Number(context.parsed ?? 0);
                const rounded = Math.round(value * 100) / 100;
                return `${rounded.toLocaleString("uk-UA", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} ${currency}`;
              },
            },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [currency]);

  // update data
  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.data.datasets[0].data = [
      totals.paid,
      totals.outstanding,
      totals.overdue,
    ];
    chartRef.current.update();
  }, [totals.paid, totals.outstanding, totals.overdue]);

  return { canvasRef };
};

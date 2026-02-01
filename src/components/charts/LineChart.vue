<template>
  <div ref="lineChartRef" :style="{ width: '100%', height: height }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import type { ECharts } from 'echarts/core';

// Registra os componentes necessários do ECharts
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  CanvasRenderer,
  UniversalTransition,
]);

export interface LineChartSeriesData {
  name: string;
  data: number[];
  color?: string;
  smooth?: boolean;
  showSymbol?: boolean;
  areaStyle?: boolean;
}

export interface LineChartProps {
  xAxisData: string[];
  series: LineChartSeriesData[];
  height?: string;
  showGrid?: boolean;
  smooth?: boolean;
  showLegend?: boolean;
}

const props = withDefaults(defineProps<LineChartProps>(), {
  height: '400px',
  showGrid: true,
  smooth: true,
  showLegend: true,
});

const $q = useQuasar();
const lineChartRef = ref<HTMLElement | null>(null);
let chartInstance: ECharts | null = null;

const initChart = () => {
  if (!lineChartRef.value) return;

  // Reutiliza a instância existente ou cria uma nova
  chartInstance = echarts.getInstanceByDom(lineChartRef.value) ?? echarts.init(lineChartRef.value);

  const seriesConfig = props.series.map((serie) => ({
    name: serie.name,
    type: 'line',
    smooth: serie.smooth ?? props.smooth,
    data: serie.data,
    itemStyle: {
      color: serie.color,
    },
    lineStyle: {
      width: 3,
      color: serie.color,
    },
    showSymbol: serie.showSymbol ?? true,
    symbolSize: 8,
    areaStyle: serie.areaStyle
      ? {
          opacity: 0.2,
        }
      : undefined,
  }));

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985',
        },
      },
    },
    legend: {
      show: props.showLegend,
      data: props.series.map((s) => s.name),
      textStyle: {
        color: $q.dark.isActive ? '#ffffff' : '#000000',
      },
    },
    grid: {
      show: props.showGrid,
      left: '3%',
      right: '4%',
      bottom: '3%',
      borderColor: $q.dark.isActive ? '#333' : '#e0e0e0',
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.xAxisData,
      axisLabel: {
        color: $q.dark.isActive ? '#ffffff' : '#000000',
      },
      axisLine: {
        lineStyle: {
          color: $q.dark.isActive ? '#333' : '#e0e0e0',
        },
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: $q.dark.isActive ? '#ffffff' : '#000000',
      },
      axisLine: {
        lineStyle: {
          color: $q.dark.isActive ? '#333' : '#e0e0e0',
        },
      },
      splitLine: {
        lineStyle: {
          color: $q.dark.isActive ? '#333' : '#e0e0e0',
        },
      },
    },
    series: seriesConfig,
  };

  chartInstance.setOption(option);
};

onMounted(() => {
  initChart();

  // Adiciona responsividade
  const resizeObserver = new ResizeObserver(() => {
    chartInstance?.resize();
  });

  if (lineChartRef.value) {
    resizeObserver.observe(lineChartRef.value);
  }
});

// Observa mudanças nos dados e atualiza o gráfico
watch(
  () => [props.xAxisData, props.series],
  () => {
    if (chartInstance) {
      initChart();
    }
  },
  { deep: true },
);

// Observa mudanças no tema dark/light
watch(
  () => $q.dark.isActive,
  () => {
    if (chartInstance) {
      initChart();
    }
  },
);

// Limpa o gráfico quando o componente é desmontado
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});
</script>

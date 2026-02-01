<template>
  <div ref="barChartRef" :style="{ width: '100%', height: height }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import * as echarts from 'echarts/core';
import { BarChart as EChartsBarChart } from 'echarts/charts';
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
  EChartsBarChart,
  CanvasRenderer,
  UniversalTransition,
]);

export interface BarChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
}

export interface BarChartData {
  labels: string[];
  datasets: BarChartDataset[];
}

export interface BarChartProps {
  data: BarChartData;
  height?: string;
  horizontal?: boolean;
  showLegend?: boolean;
  showGrid?: boolean;
  barWidth?: string | number;
}

const props = withDefaults(defineProps<BarChartProps>(), {
  height: '300px',
  horizontal: false,
  showLegend: true,
  showGrid: true,
  barWidth: '60%',
});

const $q = useQuasar();
const barChartRef = ref<HTMLElement | null>(null);
let chartInstance: ECharts | null = null;

const initChart = () => {
  if (!barChartRef.value) return;

  // Reutiliza a instância existente ou cria uma nova
  chartInstance = echarts.getInstanceByDom(barChartRef.value) ?? echarts.init(barChartRef.value);

  const seriesConfig = props.data.datasets.map((dataset) => ({
    name: dataset.label,
    type: 'bar',
    data: dataset.data.map((value, index) => ({
      value,
      itemStyle: {
        color: Array.isArray(dataset.backgroundColor)
          ? dataset.backgroundColor[index]
          : dataset.backgroundColor || '#1976D2',
      },
    })),
    barWidth: props.barWidth,
    itemStyle: {
      borderRadius: props.horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
    },
    label: {
      show: true,
      position: props.horizontal ? 'right' : 'top',
      formatter: '{c}%',
      fontSize: 11,
      color: $q.dark.isActive ? '#fff' : '#333',
    },
  }));

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      backgroundColor: $q.dark.isActive ? '#2d2d2d' : '#fff',
      textStyle: {
        color: $q.dark.isActive ? '#fff' : '#333',
      },
    },
    legend: {
      show: props.showLegend && props.data.datasets.length > 1,
      bottom: 0,
      textStyle: {
        color: $q.dark.isActive ? '#fff' : '#333',
      },
    },
    grid: {
      left: props.horizontal ? '15%' : '3%',
      right: '4%',
      bottom: props.showLegend && props.data.datasets.length > 1 ? '15%' : '3%',
      top: '10%',
      containLabel: true,
    },
    xAxis: props.horizontal
      ? {
          type: 'value',
          max: 100,
          axisLine: {
            show: props.showGrid,
            lineStyle: { color: $q.dark.isActive ? '#555' : '#ddd' },
          },
          splitLine: {
            show: props.showGrid,
            lineStyle: { color: $q.dark.isActive ? '#333' : '#eee' },
          },
          axisLabel: {
            color: $q.dark.isActive ? '#aaa' : '#666',
            formatter: '{value}%',
          },
        }
      : {
          type: 'category',
          data: props.data.labels,
          axisLine: {
            show: props.showGrid,
            lineStyle: { color: $q.dark.isActive ? '#555' : '#ddd' },
          },
          axisLabel: {
            color: $q.dark.isActive ? '#aaa' : '#666',
            rotate: props.data.labels.length > 5 ? 45 : 0,
            interval: 0,
          },
        },
    yAxis: props.horizontal
      ? {
          type: 'category',
          data: props.data.labels,
          axisLine: {
            show: props.showGrid,
            lineStyle: { color: $q.dark.isActive ? '#555' : '#ddd' },
          },
          axisLabel: {
            color: $q.dark.isActive ? '#aaa' : '#666',
          },
        }
      : {
          type: 'value',
          max: 100,
          axisLine: {
            show: props.showGrid,
            lineStyle: { color: $q.dark.isActive ? '#555' : '#ddd' },
          },
          splitLine: {
            show: props.showGrid,
            lineStyle: { color: $q.dark.isActive ? '#333' : '#eee' },
          },
          axisLabel: {
            color: $q.dark.isActive ? '#aaa' : '#666',
            formatter: '{value}%',
          },
        },
    series: seriesConfig,
  };

  chartInstance.setOption(option, true);
};

// Redimensiona o gráfico quando a janela muda de tamanho
const handleResize = () => {
  chartInstance?.resize();
};

// Observa mudanças nos dados
watch(
  () => props.data,
  () => {
    initChart();
  },
  { deep: true },
);

// Observa mudanças no modo escuro
watch(
  () => $q.dark.isActive,
  () => {
    initChart();
  },
);

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  chartInstance?.dispose();
});
</script>

<style scoped lang="scss"></style>

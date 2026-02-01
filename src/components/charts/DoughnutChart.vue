<template>
  <div ref="doughnutChartRef" :style="{ width: '100%', height: height }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import type { ECharts } from 'echarts/core';

// Registra os componentes necessários do ECharts
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  PieChart,
  CanvasRenderer,
  LabelLayout,
]);

export interface DoughnutChartDataItem {
  value: number;
  name: string;
  itemStyle?: { color: string };
}

export interface DoughnutChartProps {
  data: DoughnutChartDataItem[];
  height?: string;
  radius?: [string, string];
  borderRadius?: number;
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  seriesName?: string;
}

const props = withDefaults(defineProps<DoughnutChartProps>(), {
  height: '400px',
  radius: () => ['50%', '70%'],
  borderRadius: 10,
  showLegend: true,
  legendPosition: 'bottom',
  seriesName: 'Data',
});

const $q = useQuasar();
const doughnutChartRef = ref<HTMLElement | null>(null);
let chartInstance: ECharts | null = null;

const initChart = () => {
  if (!doughnutChartRef.value) return;

  // Reutiliza a instância existente ou cria uma nova
  chartInstance =
    echarts.getInstanceByDom(doughnutChartRef.value) ?? echarts.init(doughnutChartRef.value);

  const legendConfig: Record<string, unknown> = {
    show: props.showLegend,
    icon: 'circle',
  };

  if (props.showLegend) {
    if (props.legendPosition === 'top' || props.legendPosition === 'bottom') {
      legendConfig.orient = 'horizontal';
      legendConfig[props.legendPosition] = 20;
      legendConfig.left = 'center';
    } else {
      legendConfig.orient = 'vertical';
      legendConfig[props.legendPosition] = 20;
      legendConfig.top = 'center';
    }
  }

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: legendConfig,
    series: [
      {
        name: props.seriesName,
        type: 'pie',
        radius: props.radius,
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: props.borderRadius,
          borderColor: $q.dark.isActive ? '#1e1e1e' : '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 24,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: props.data,
      },
    ],
  };

  chartInstance.setOption(option);
};

onMounted(() => {
  initChart();

  // Adiciona responsividade
  const resizeObserver = new ResizeObserver(() => {
    chartInstance?.resize();
  });

  if (doughnutChartRef.value) {
    resizeObserver.observe(doughnutChartRef.value);
  }
});

// Observa mudanças nos dados e atualiza o gráfico
watch(
  () => props.data,
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

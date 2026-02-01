<template>
  <div ref="pieChartRef" :style="{ width: '100%', height: height }"></div>
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

export interface PieChartDataItem {
  value: number;
  name: string;
  itemStyle?: { color: string };
}

export interface PieChartProps {
  data: PieChartDataItem[];
  height?: string;
  radius?: string;
  borderRadius?: number;
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  seriesName?: string;
  showLabels?: boolean;
  showTooltip?: boolean;
}

const props = withDefaults(defineProps<PieChartProps>(), {
  height: '400px',
  radius: '70%',
  borderRadius: 10,
  showLegend: true,
  legendPosition: 'bottom',
  seriesName: 'Data',
  showLabels: false,
  showTooltip: true,
});

const $q = useQuasar();
const pieChartRef = ref<HTMLElement | null>(null);
let chartInstance: ECharts | null = null;

const initChart = () => {
  if (!pieChartRef.value) return;

  // Reutiliza a instância existente ou cria uma nova
  chartInstance = echarts.getInstanceByDom(pieChartRef.value) ?? echarts.init(pieChartRef.value);

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

  // Configuração de estilo baseada no tema
  const textColor = $q.dark.isActive ? '#ffffff' : '#0f172a';

  // Atualiza a cor do texto da legenda
  if (props.showLegend) {
    legendConfig.textStyle = {
      color: textColor,
    };
  }

  const option = {
    tooltip: {
      show: props.showTooltip,
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
          borderColor: $q.dark.isActive ? '#0f172a' : '#fff',
          borderWidth: 2,
        },
        label: {
          show: props.showLabels,
          position: 'outside',
          formatter: '{b}: {d}%',
          color: textColor,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 18,
            fontWeight: 'bold',
            color: textColor,
          },
        },
        labelLine: {
          show: props.showLabels,
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

  if (pieChartRef.value) {
    resizeObserver.observe(pieChartRef.value);
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

watch(
  () => props.showLabels,
  () => {
    if (chartInstance) {
      initChart();
    }
  },
  { deep: true },
);

// Limpa o gráfico quando o componente é desmontado
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});
</script>

<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h4 class="text-h4 q-my-none">Dashboard de Partidas</h4>
        <p class="text-body2 text-grey-7 q-mt-sm">
          Estatísticas e análises do histórico de partidas MLBB
        </p>
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          icon="lucide:user"
          label="Análise de Jogador"
          to="/dashboard/player"
          unelevated
        />
      </div>
    </div>

    <!-- KPIs Principais -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-6 col-md-3">
        <q-card class="kpi-card bg-primary text-white">
          <q-card-section>
            <div class="text-overline">Total de Partidas</div>
            <div class="text-h3 text-weight-bold">{{ overallStats.totalMatches }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-6 col-md-3">
        <q-card class="kpi-card bg-positive text-white">
          <q-card-section>
            <div class="text-overline">Vitórias</div>
            <div class="text-h3 text-weight-bold">
              {{ overallStats.wins }}
              <span class="text-subtitle1">({{ overallStats.winRate }}%)</span>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-6 col-md-3">
        <q-card class="kpi-card bg-negative text-white">
          <q-card-section>
            <div class="text-overline">Derrotas</div>
            <div class="text-h3 text-weight-bold">
              {{ overallStats.losses }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-6 col-md-3">
        <q-card class="kpi-card bg-secondary text-white">
          <q-card-section>
            <div class="text-overline">Duração Média</div>
            <div class="text-h3 text-weight-bold">{{ overallStats.avgDuration }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Estatísticas de KDA e Placar -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="lucide:swords" class="q-mr-sm" />
              Estatísticas de Combate (Médias por Partida)
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-4 text-center">
                <div class="text-h4 text-positive">{{ overallStats.avgKillsPerMatch }}</div>
                <div class="text-caption text-grey-7">Kills</div>
              </div>
              <div class="col-4 text-center">
                <div class="text-h4 text-negative">{{ overallStats.avgDeathsPerMatch }}</div>
                <div class="text-caption text-grey-7">Deaths</div>
              </div>
              <div class="col-4 text-center">
                <div class="text-h4 text-info">{{ overallStats.avgAssistsPerMatch }}</div>
                <div class="text-caption text-grey-7">Assists</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="lucide:target" class="q-mr-sm" />
              Placar Médio
            </div>
            <div class="row q-col-gutter-md items-center">
              <div class="col text-center">
                <div class="text-h4 text-positive">{{ overallStats.avgTeamScore }}</div>
                <div class="text-caption text-grey-7">Meu Time</div>
              </div>
              <div class="col-auto">
                <div class="text-h5 text-grey-5">vs</div>
              </div>
              <div class="col text-center">
                <div class="text-h4 text-negative">{{ overallStats.avgEnemyScore }}</div>
                <div class="text-caption text-grey-7">Adversário</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Gráficos -->
    <div class="row q-col-gutter-md q-mb-lg">
      <!-- Win Rate Pie -->
      <div class="col-12 col-md-4">
        <q-card class="full-height">
          <q-card-section>
            <div class="text-h6">Taxa de Vitória</div>
          </q-card-section>
          <q-card-section>
            <DoughnutChart :data="winRateChartData" height="250px" series-name="Resultado" />
          </q-card-section>
        </q-card>
      </div>

      <!-- Medal Distribution -->
      <div class="col-12 col-md-4">
        <q-card class="full-height">
          <q-card-section>
            <div class="text-h6">Distribuição de Medalhas</div>
          </q-card-section>
          <q-card-section>
            <PieChart :data="medalChartData" height="250px" series-name="Medalhas" />
          </q-card-section>
        </q-card>
      </div>

      <!-- Top MVPs -->
      <div class="col-12 col-md-4">
        <q-card class="full-height">
          <q-card-section>
            <div class="text-h6">Top MVPs</div>
          </q-card-section>
          <q-card-section>
            <q-list dense>
              <q-item v-for="(mvp, idx) in topMvpPlayers" :key="mvp.nickname">
                <q-item-section avatar>
                  <q-avatar
                    :color="idx === 0 ? 'amber' : idx === 1 ? 'grey-5' : 'brown-5'"
                    text-color="white"
                    size="sm"
                  >
                    {{ idx + 1 }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ mvp.nickname }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge color="primary">{{ mvp.count }} MVPs</q-badge>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Win/Loss Trend -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">
              <q-icon name="lucide:trending-up" class="q-mr-sm" />
              Histórico de Resultados (Últimas {{ trendData.labels.length }} partidas)
            </div>
          </q-card-section>
          <q-card-section>
            <BarChart :data="trendChartData" height="300px" :show-legend="true" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Leaderboard -->
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">
              <q-icon name="lucide:trophy" class="q-mr-sm" />
              Ranking de Jogadores (por Ratio médio)
            </div>
          </q-card-section>
          <q-card-section class="q-pa-none">
            <q-table
              :rows="leaderboard"
              :columns="leaderboardColumns"
              row-key="nickname"
              flat
              :pagination="{ rowsPerPage: 10 }"
              :rows-per-page-options="[5, 10, 20, 0]"
            >
              <template v-slot:body-cell-nickname="props">
                <q-td :props="props">
                  <router-link
                    :to="`/dashboard/player/${encodeURIComponent(props.row.nickname)}`"
                    class="text-primary text-weight-medium"
                  >
                    {{ props.row.nickname }}
                  </router-link>
                </q-td>
              </template>

              <template v-slot:body-cell-winRate="props">
                <q-td :props="props">
                  <q-badge
                    :color="props.row.winRate >= 50 ? 'positive' : 'negative'"
                    :label="`${props.row.winRate}%`"
                  />
                </q-td>
              </template>

              <template v-slot:body-cell-avgRatio="props">
                <q-td :props="props">
                  <q-badge
                    :color="
                      props.row.avgRatio > 7.6 ? 'amber' : props.row.avgRatio > 5 ? 'grey' : 'brown'
                    "
                    :label="props.row.avgRatio.toFixed(1)"
                  />
                </q-td>
              </template>

              <template v-slot:body-cell-medals="props">
                <q-td :props="props">
                  <span class="q-mr-sm">
                    <q-icon name="lucide:medal" color="amber" />
                    {{ props.row.goldMedals }}
                  </span>
                  <span class="q-mr-sm">
                    <q-icon name="lucide:medal" color="grey" />
                    {{ props.row.silverMedals }}
                  </span>
                  <span>
                    <q-icon name="lucide:medal" color="brown" />
                    {{ props.row.copperMedals }}
                  </span>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMatchStats } from '../composables/useMatchStats';
import DoughnutChart from '../components/charts/DoughnutChart.vue';
import PieChart from '../components/charts/PieChart.vue';
import BarChart from '../components/charts/BarChart.vue';

const { overallStats, leaderboard, getWinLossTrend, medalDistribution, topMvpPlayers } =
  useMatchStats();

// Win Rate Chart Data
const winRateChartData = computed(() => [
  { value: overallStats.value.wins, name: 'Vitórias', itemStyle: { color: '#21BA45' } },
  { value: overallStats.value.losses, name: 'Derrotas', itemStyle: { color: '#C10015' } },
]);

// Medal Distribution Chart Data
const medalChartData = computed(() => [
  { value: medalDistribution.value.gold, name: 'Gold', itemStyle: { color: '#FFD700' } },
  { value: medalDistribution.value.silver, name: 'Silver', itemStyle: { color: '#C0C0C0' } },
  { value: medalDistribution.value.copper, name: 'Copper', itemStyle: { color: '#CD7F32' } },
]);

// Win/Loss Trend
const trendData = computed(() => getWinLossTrend(15));

const trendChartData = computed(() => ({
  labels: trendData.value.labels,
  datasets: [
    {
      label: 'Vitória',
      data: trendData.value.wins,
      backgroundColor: '#21BA45',
    },
    {
      label: 'Derrota',
      data: trendData.value.losses,
      backgroundColor: '#C10015',
    },
  ],
}));

// Leaderboard Columns
const leaderboardColumns = [
  { name: 'nickname', label: 'Jogador', field: 'nickname', align: 'left' as const, sortable: true },
  {
    name: 'totalMatches',
    label: 'Partidas',
    field: 'totalMatches',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'winRate',
    label: 'Win Rate',
    field: 'winRate',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'avgKills',
    label: 'Avg Kills',
    field: 'avgKills',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'avgDeaths',
    label: 'Avg Deaths',
    field: 'avgDeaths',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'avgAssists',
    label: 'Avg Assists',
    field: 'avgAssists',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'avgRatio',
    label: 'Avg Ratio',
    field: 'avgRatio',
    align: 'center' as const,
    sortable: true,
  },
  { name: 'mvpCount', label: 'MVPs', field: 'mvpCount', align: 'center' as const, sortable: true },
  {
    name: 'medals',
    label: 'Medalhas',
    field: 'goldMedals',
    align: 'center' as const,
    sortable: false,
  },
];
</script>

<style scoped lang="scss">
.kpi-card {
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-4px);
  }
}

.full-height {
  height: 100%;
}
</style>

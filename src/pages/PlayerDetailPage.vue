<template>
  <q-page class="q-pa-md">
    <!-- Seleção de Jogador (se não vier pela rota) -->
    <div class="row q-mb-lg items-center">
      <div class="col">
        <q-btn flat icon="lucide:arrow-left" label="Voltar" to="/dashboard" class="q-mb-sm" />
        <h4 class="text-h4 q-my-none">Análise de Jogador</h4>
        <p class="text-body2 text-grey-7 q-mt-sm">
          Estatísticas detalhadas e histórico de partidas
        </p>
      </div>
    </div>

    <!-- Seletor de Jogador -->
    <q-card class="q-mb-lg">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-6">
            <q-select
              v-model="selectedPlayer"
              :options="uniquePlayers"
              label="Selecionar Jogador"
              outlined
              dense
              emit-value
              map-options
              :option-label="(opt) => opt"
              :option-value="(opt) => opt"
            >
              <template v-slot:prepend>
                <q-icon name="lucide:user" />
              </template>
            </q-select>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Conteúdo quando jogador selecionado -->
    <template v-if="playerStats">
      <!-- Header do Jogador -->
      <q-card class="q-mb-lg custom-bg">
        <q-card-section>
          <div class="row items-center">
            <div class="col-auto">
              <q-avatar size="80px" color="primary" text-color="white" class="text-h4">
                {{ playerStats.nickname.charAt(0).toUpperCase() }}
              </q-avatar>
            </div>
            <div class="col q-ml-md">
              <div class="text-h5 text-weight-bold">{{ playerStats.nickname }}</div>
              <div class="text-subtitle1 text-grey-6">
                {{ playerStats.totalMatches }} partidas jogadas
              </div>
            </div>
            <div class="col-auto text-right">
              <div
                class="text-h3 text-weight-bold"
                :class="playerStats.winRate >= 50 ? 'text-positive' : 'text-negative'"
              >
                {{ playerStats.winRate }}%
              </div>
              <div class="text-caption text-grey-6">Win Rate</div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- KPIs do Jogador -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-6 col-md-2">
          <q-card>
            <q-card-section class="text-center">
              <div class="text-h5 text-positive">{{ playerStats.wins }}</div>
              <div class="text-caption text-grey-7">Vitórias</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-md-2">
          <q-card>
            <q-card-section class="text-center">
              <div class="text-h5 text-negative">{{ playerStats.losses }}</div>
              <div class="text-caption text-grey-7">Derrotas</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-md-2">
          <q-card>
            <q-card-section class="text-center">
              <div class="text-h5 text-amber">{{ playerStats.mvpCount }}</div>
              <div class="text-caption text-grey-7">MVPs</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-md-2">
          <q-card>
            <q-card-section class="text-center">
              <div class="text-h5">{{ playerStats.avgRatio }}</div>
              <div class="text-caption text-grey-7">Ratio Médio</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-md-2">
          <q-card>
            <q-card-section class="text-center">
              <div class="text-h5 text-positive">{{ playerStats.bestRatio }}</div>
              <div class="text-caption text-grey-7">Melhor Ratio</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-md-2">
          <q-card>
            <q-card-section class="text-center">
              <div class="text-h5 text-negative">{{ playerStats.worstRatio }}</div>
              <div class="text-caption text-grey-7">Pior Ratio</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Estatísticas de Combate -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-md-6">
          <q-card class="full-height">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="lucide:swords" class="q-mr-sm" />
                Estatísticas de Combate
              </div>

              <div class="row q-col-gutter-lg">
                <div class="col-12">
                  <div class="row items-center q-mb-md">
                    <div class="col-4 text-caption">Kills (média)</div>
                    <div class="col">
                      <q-linear-progress
                        :value="playerStats.avgKills / 25"
                        color="positive"
                        size="24px"
                        rounded
                      >
                        <div class="absolute-full flex flex-center">
                          <q-badge color="white" text-color="dark" :label="playerStats.avgKills" />
                        </div>
                        <!-- <div class="absolute-full flex flex-center">
                          <span class="text-white text-weight-bold">{{
                            playerStats.avgKills
                          }}</span>
                        </div> -->
                      </q-linear-progress>
                    </div>
                  </div>

                  <div class="row items-center q-mb-md">
                    <div class="col-4 text-caption">Deaths (média)</div>
                    <div class="col">
                      <q-linear-progress
                        :value="playerStats.avgDeaths / 15"
                        color="negative"
                        size="20px"
                        rounded
                      >
                        <div class="absolute-full flex flex-center">
                          <q-badge color="white" text-color="dark" :label="playerStats.avgDeaths" />
                        </div>
                        <!-- <div class="absolute-full flex flex-center">
                          <span class="text-white text-weight-bold">{{
                            playerStats.avgDeaths
                          }}</span>
                        </div> -->
                      </q-linear-progress>
                    </div>
                  </div>

                  <div class="row items-center q-mb-md">
                    <div class="col-4 text-caption">Assists (média)</div>
                    <div class="col">
                      <q-linear-progress
                        :value="playerStats.avgAssists / 20"
                        color="info"
                        size="20px"
                        rounded
                      >
                        <div class="absolute-full flex flex-center">
                          <q-badge
                            color="white"
                            text-color="dark"
                            :label="playerStats.avgAssists"
                          />
                        </div>
                        <!-- <div class="absolute-full flex flex-center">
                          <span class="text-white text-weight-bold">{{
                            playerStats.avgAssists
                          }}</span>
                        </div> -->
                      </q-linear-progress>
                    </div>
                  </div>
                </div>
              </div>

              <q-separator class="q-my-md" />

              <div class="row q-col-gutter-md text-center">
                <div class="col-4">
                  <div class="text-h6">{{ playerStats.totalKills }}</div>
                  <div class="text-caption text-grey-7">Total Kills</div>
                </div>
                <div class="col-4">
                  <div class="text-h6">{{ playerStats.totalDeaths }}</div>
                  <div class="text-caption text-grey-7">Total Deaths</div>
                </div>
                <div class="col-4">
                  <div class="text-h6">{{ playerStats.totalAssists }}</div>
                  <div class="text-caption text-grey-7">Total Assists</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-6">
          <q-card class="full-height">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="lucide:medal" class="q-mr-sm" />
                Medalhas e Ouro
              </div>

              <div class="row q-col-gutter-md text-center q-mb-md">
                <div class="col-4">
                  <q-avatar size="60px" color="amber" text-color="white">
                    <q-icon name="lucide:medal" size="sm" />
                  </q-avatar>
                  <div class="text-h5 q-mt-sm">{{ playerStats.goldMedals }}</div>
                  <div class="text-caption text-grey-7">Gold</div>
                </div>
                <div class="col-4">
                  <q-avatar size="60px" color="grey-5" text-color="white">
                    <q-icon name="lucide:medal" size="sm" />
                  </q-avatar>
                  <div class="text-h5 q-mt-sm">{{ playerStats.silverMedals }}</div>
                  <div class="text-caption text-grey-7">Silver</div>
                </div>
                <div class="col-4">
                  <q-avatar size="60px" color="brown-5" text-color="white">
                    <q-icon name="lucide:medal" size="sm" />
                  </q-avatar>
                  <div class="text-h5 q-mt-sm">{{ playerStats.copperMedals }}</div>
                  <div class="text-caption text-grey-7">Copper</div>
                </div>
              </div>

              <q-separator class="q-my-md" />

              <div class="row q-col-gutter-md text-center">
                <div class="col-6">
                  <div class="text-h5 text-amber">{{ playerStats.totalGold.toLocaleString() }}</div>
                  <div class="text-caption text-grey-7">Ouro Total</div>
                </div>
                <div class="col-6">
                  <div class="text-h5">{{ playerStats.avgGold.toLocaleString() }}</div>
                  <div class="text-caption text-grey-7">Ouro Médio</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Gráficos de Performance -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12">
          <q-card>
            <q-card-section>
              <div class="text-h6">
                <q-icon name="lucide:trending-up" class="q-mr-sm" />
                Evolução de KDA por Partida
              </div>
            </q-card-section>
            <q-card-section>
              <LineChart
                :x-axis-data="kdaTrend.labels"
                :series="kdaChartSeries"
                height="350px"
                :smooth="true"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Evolução do Ratio -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12">
          <q-card>
            <q-card-section>
              <div class="text-h6">
                <q-icon name="lucide:activity" class="q-mr-sm" />
                Evolução do Ratio
              </div>
            </q-card-section>
            <q-card-section>
              <LineChart
                :x-axis-data="kdaTrend.labels"
                :series="ratioChartSeries"
                height="300px"
                :smooth="true"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Histórico de Partidas -->
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-card>
            <q-card-section>
              <div class="text-h6">
                <q-icon name="lucide:history" class="q-mr-sm" />
                Histórico de Partidas
              </div>
            </q-card-section>
            <q-card-section class="q-pa-none">
              <q-table
                :rows="playerStats.matchHistory"
                :columns="historyColumns"
                row-key="matchIndex"
                flat
                :pagination="{ rowsPerPage: 10 }"
                :rows-per-page-options="[5, 10, 20, 0]"
              >
                <template v-slot:body-cell-result="props">
                  <q-td :props="props">
                    <q-badge
                      :color="props.row.result === 'VICTORY' ? 'positive' : 'negative'"
                      :label="props.row.result === 'VICTORY' ? 'Vitória' : 'Derrota'"
                    />
                  </q-td>
                </template>

                <template v-slot:body-cell-score="props">
                  <q-td :props="props">
                    <span class="text-positive">{{ props.row.teamScore }}</span>
                    <span class="text-grey-5"> vs </span>
                    <span class="text-negative">{{ props.row.enemyScore }}</span>
                  </q-td>
                </template>

                <template v-slot:body-cell-kda="props">
                  <q-td :props="props">
                    <span class="text-positive">{{ props.row.kills }}</span>
                    <span class="text-grey-5">/</span>
                    <span class="text-negative">{{ props.row.deaths }}</span>
                    <span class="text-grey-5">/</span>
                    <span class="text-info">{{ props.row.assists }}</span>
                  </q-td>
                </template>

                <template v-slot:body-cell-ratio="props">
                  <q-td :props="props">
                    <q-badge
                      :color="
                        props.row.ratio > 7.6 ? 'amber' : props.row.ratio > 5 ? 'grey' : 'brown'
                      "
                      :label="props.row.ratio.toFixed(1)"
                    />
                  </q-td>
                </template>

                <template v-slot:body-cell-medal="props">
                  <q-td :props="props">
                    <q-icon
                      name="lucide:medal"
                      :color="
                        props.row.medal === 'GOLD'
                          ? 'amber'
                          : props.row.medal === 'SILVER'
                            ? 'grey'
                            : 'brown'
                      "
                      size="sm"
                    />
                  </q-td>
                </template>

                <template v-slot:body-cell-mvp="props">
                  <q-td :props="props">
                    <q-icon v-if="props.row.is_mvp" name="lucide:star" color="amber" size="sm" />
                    <span v-else class="text-grey-5">-</span>
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>

    <!-- Mensagem quando nenhum jogador selecionado -->
    <template v-else>
      <q-card flat bordered class="text-center q-pa-xl">
        <q-icon name="lucide:user" size="64px" color="grey-5" />
        <p class="text-h6 text-grey-6 q-mt-md">Nenhum jogador selecionado</p>
        <p class="text-body2 text-grey-5">
          Selecione um jogador acima para ver suas estatísticas detalhadas
        </p>
      </q-card>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMatchStats, type PlayerAggregatedStats } from '../composables/useMatchStats';
import LineChart from '../components/charts/LineChart.vue';

const route = useRoute();
const router = useRouter();

const { uniquePlayers, getPlayerStats, getPlayerKdaTrend } = useMatchStats();

const selectedPlayer = ref<string | null>(null);

// Inicializar com jogador da rota, se houver
onMounted(() => {
  if (route.params.nickname) {
    const nick = decodeURIComponent(route.params.nickname as string);
    if (uniquePlayers.value.includes(nick)) {
      selectedPlayer.value = nick;
    }
  } else if (uniquePlayers.value.length > 0) {
    // Default para MTF7 se existir, senão primeiro da lista
    selectedPlayer.value = uniquePlayers.value.includes('MTF7')
      ? 'MTF7'
      : uniquePlayers.value[0] || null;
  }
});

// Atualizar rota quando mudar jogador
watch(selectedPlayer, (newVal) => {
  if (newVal && newVal !== route.params.nickname) {
    void router.replace(`/player/${encodeURIComponent(newVal)}`);
  }
});

const playerStats = computed<PlayerAggregatedStats | null>(() => {
  if (!selectedPlayer.value) return null;
  return getPlayerStats(selectedPlayer.value);
});

const kdaTrend = computed(() => {
  if (!selectedPlayer.value) return { labels: [], kills: [], deaths: [], assists: [], ratios: [] };
  return getPlayerKdaTrend(selectedPlayer.value);
});

const kdaChartSeries = computed(() => [
  { name: 'Kills', data: kdaTrend.value.kills, color: '#21BA45', smooth: true, areaStyle: false },
  { name: 'Deaths', data: kdaTrend.value.deaths, color: '#C10015', smooth: true, areaStyle: false },
  {
    name: 'Assists',
    data: kdaTrend.value.assists,
    color: '#1976D2',
    smooth: true,
    areaStyle: false,
  },
]);

const ratioChartSeries = computed(() => [
  { name: 'Ratio', data: kdaTrend.value.ratios, color: '#FF9800', smooth: true, areaStyle: true },
]);

const historyColumns = [
  { name: 'matchIndex', label: '#', field: 'matchIndex', align: 'center' as const },
  { name: 'result', label: 'Resultado', field: 'result', align: 'center' as const },
  { name: 'score', label: 'Placar', field: 'teamScore', align: 'center' as const },
  { name: 'duration', label: 'Duração', field: 'duration', align: 'center' as const },
  { name: 'kda', label: 'K/D/A', field: 'kills', align: 'center' as const },
  { name: 'ratio', label: 'Ratio', field: 'ratio', align: 'center' as const, sortable: true },
  {
    name: 'gold',
    label: 'Ouro',
    field: 'gold',
    align: 'center' as const,
    format: (val: number) => val.toLocaleString(),
  },
  { name: 'medal', label: 'Medalha', field: 'medal', align: 'center' as const },
  { name: 'mvp', label: 'MVP', field: 'is_mvp', align: 'center' as const },
];
</script>

<style scoped lang="scss">
// .bg-gradient {
//   background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
//   color: white;

//   .text-grey-6 {
//     color: rgba(255, 255, 255, 0.7) !important;
//   }
// }
</style>

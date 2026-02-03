<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row q-mb-lg items-center">
      <div class="col">
        <q-btn flat icon="lucide:arrow-left" label="Voltar" to="/dashboard" class="q-mb-sm" />
        <h4 class="text-h4 q-my-none">Análise de Time</h4>
        <p class="text-body2 text-grey-7 q-mt-sm">
          Analise suas estatísticas jogando com outros jogadores
        </p>
      </div>
    </div>

    <!-- Seleção de Jogadores -->
    <q-card class="q-mb-lg">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="lucide:users" class="q-mr-sm" />
          Selecionar Jogadores
        </div>

        <div class="row q-col-gutter-md">
          <!-- Jogador Principal -->
          <div class="col-12 col-md-4">
            <q-select
              v-model="mainPlayer"
              :options="uniquePlayers"
              label="Jogador Principal"
              outlined
              dense
              emit-value
              map-options
              clearable
              :option-label="(opt) => opt"
              :option-value="(opt) => opt"
            >
              <template v-slot:prepend>
                <q-icon name="lucide:user" />
              </template>
            </q-select>
          </div>

          <!-- Teammates -->
          <div class="col-12 col-md-8">
            <q-select
              v-model="selectedTeammates"
              :options="availableTeammates"
              label="Teammates (DUO, TRIO, FULL_SQUAD)"
              outlined
              dense
              multiple
              emit-value
              map-options
              use-chips
              clearable
              :disable="!mainPlayer"
              :option-label="(opt) => opt"
              :option-value="(opt) => opt"
            >
              <template v-slot:prepend>
                <q-icon name="lucide:users" />
              </template>
              <template v-slot:hint>
                Selecione 1 para DUO, 2 para TRIO ou 3+ para FULL_SQUAD
              </template>
            </q-select>
          </div>
        </div>

        <!-- Teammates Sugeridos -->
        <div v-if="mainPlayer && frequentTeammates.length > 0" class="q-mt-md">
          <div class="text-caption text-grey-7 q-mb-sm">Teammates frequentes:</div>
          <div class="row q-gutter-sm">
            <q-chip
              v-for="tm in frequentTeammates"
              :key="tm.nickname"
              clickable
              :color="selectedTeammates.includes(tm.nickname) ? 'primary' : 'grey-4'"
              :text-color="selectedTeammates.includes(tm.nickname) ? 'white' : 'dark'"
              @click="toggleTeammate(tm.nickname)"
            >
              {{ tm.nickname }}
              <q-badge floating color="accent">{{ tm.matchCount }}</q-badge>
            </q-chip>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Estatísticas por Grupo (Overview) -->
    <q-card v-if="mainPlayer && !selectedTeammates.length" class="q-mb-lg">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="lucide:bar-chart-3" class="q-mr-sm" />
          Estatísticas por Tipo de Grupo
        </div>
        <div class="row q-col-gutter-md">
          <div v-for="gs in groupStats" :key="gs.group" class="col-6 col-md-3">
            <q-card bordered>
              <q-card-section class="text-center">
                <q-badge :color="getGroupColor(gs.group)" class="q-mb-sm">
                  {{ gs.group }}
                </q-badge>
                <div class="text-h5">{{ gs.totalMatches }}</div>
                <div class="text-caption text-grey-7">Partidas</div>
                <q-separator class="q-my-sm" />
                <div
                  class="text-subtitle1"
                  :class="gs.winRate >= 50 ? 'text-positive' : 'text-negative'"
                >
                  {{ gs.winRate }}% WR
                </div>
                <div class="text-caption">{{ gs.wins }}V / {{ gs.losses }}D</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Resultados da Análise -->
    <template v-if="teammateAnalysis">
      <!-- Header da Análise -->
      <q-card class="q-mb-lg custom-bg">
        <q-card-section>
          <div class="row items-center">
            <div class="col">
              <div class="text-h5 text-weight-bold">
                <q-icon name="lucide:users" class="q-mr-sm" />
                {{ getTeamLabel }}
              </div>
              <div class="text-subtitle1 text-grey-6">
                {{ teammateAnalysis.totalMatches }} partidas juntos
              </div>
            </div>
            <div class="col-auto text-right">
              <div
                class="text-h3 text-weight-bold"
                :class="teammateAnalysis.winRate >= 50 ? 'text-positive' : 'text-negative'"
              >
                {{ teammateAnalysis.winRate }}%
              </div>
              <div class="text-caption text-grey-6">Win Rate</div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- KPIs do Time -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-6 col-md-2">
          <q-card>
            <q-card-section class="text-center">
              <div class="text-h5 text-positive">{{ teammateAnalysis.wins }}</div>
              <div class="text-caption text-grey-7">Vitórias</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-md-2">
          <q-card>
            <q-card-section class="text-center">
              <div class="text-h5 text-negative">{{ teammateAnalysis.losses }}</div>
              <div class="text-caption text-grey-7">Derrotas</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-md-2">
          <q-card>
            <q-card-section class="text-center">
              <div class="text-h5">{{ teammateAnalysis.avgTeamRatio }}</div>
              <div class="text-caption text-grey-7">Ratio Médio</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-md-2">
          <q-card>
            <q-card-section class="text-center">
              <div class="text-h5">{{ teammateAnalysis.avgDuration }}</div>
              <div class="text-caption text-grey-7">Duração Média</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-md-2">
          <q-card>
            <q-card-section class="text-center">
              <div class="text-h5 text-positive">{{ teammateAnalysis.avgTeamScore }}</div>
              <div class="text-caption text-grey-7">Score Médio</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-md-2">
          <q-card>
            <q-card-section class="text-center">
              <div class="text-h5 text-negative">{{ teammateAnalysis.avgEnemyScore }}</div>
              <div class="text-caption text-grey-7">Score Inimigo</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- KDA do Time -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="lucide:swords" class="q-mr-sm" />
                KDA Médio do Time
              </div>
              <div class="row q-col-gutter-md text-center">
                <div class="col-4">
                  <div class="text-h4 text-positive">{{ teammateAnalysis.avgTeamKills }}</div>
                  <div class="text-caption">Kills</div>
                </div>
                <div class="col-4">
                  <div class="text-h4 text-negative">{{ teammateAnalysis.avgTeamDeaths }}</div>
                  <div class="text-caption">Deaths</div>
                </div>
                <div class="col-4">
                  <div class="text-h4 text-info">{{ teammateAnalysis.avgTeamAssists }}</div>
                  <div class="text-caption">Assists</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- MVP Distribution -->
        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="lucide:trophy" class="q-mr-sm" />
                Distribuição de MVPs
              </div>
              <div v-if="teammateAnalysis.mvpDistribution.length > 0">
                <div
                  v-for="mvp in teammateAnalysis.mvpDistribution"
                  :key="mvp.nickname"
                  class="row items-center q-mb-sm"
                >
                  <div class="col-4 text-caption">{{ mvp.nickname }}</div>
                  <div class="col">
                    <q-linear-progress
                      :value="mvp.count / teammateAnalysis.totalMatches"
                      color="amber"
                      size="20px"
                      rounded
                    >
                      <div class="absolute-full flex flex-center">
                        <span class="text-white text-weight-bold text-caption">{{
                          mvp.count
                        }}</span>
                      </div>
                    </q-linear-progress>
                  </div>
                </div>
              </div>
              <div v-else class="text-grey-6 text-center">Nenhum MVP registrado</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Breakdown por Jogador -->
      <q-card class="q-mb-lg">
        <q-card-section>
          <div class="text-h6 q-mb-md">
            <q-icon name="lucide:users" class="q-mr-sm" />
            Estatísticas por Jogador
          </div>
          <q-table
            :rows="teammateAnalysis.playerBreakdown"
            :columns="playerColumns"
            row-key="nickname"
            flat
            bordered
            :pagination="{ rowsPerPage: 10 }"
          >
            <template v-slot:body-cell-nickname="props">
              <q-td :props="props">
                <router-link
                  :to="`/player/${props.row.nickname}`"
                  class="text-primary text-weight-medium"
                >
                  {{ props.row.nickname }}
                  <q-badge v-if="props.row.nickname === mainPlayer" color="primary" class="q-ml-xs">
                    Principal
                  </q-badge>
                </router-link>
              </q-td>
            </template>
            <template v-slot:body-cell-winRate="props">
              <q-td :props="props">
                <span :class="props.row.winRate >= 50 ? 'text-positive' : 'text-negative'">
                  {{ props.row.winRate }}%
                </span>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>

      <!-- Histórico de Partidas -->
      <q-card>
        <q-card-section>
          <div class="text-h6 q-mb-md">
            <q-icon name="lucide:history" class="q-mr-sm" />
            Histórico de Partidas Juntos
          </div>
          <q-table
            :rows="teammateAnalysis.matchHistory"
            :columns="matchColumns"
            row-key="matchIndex"
            flat
            bordered
            :pagination="{ rowsPerPage: 10 }"
          >
            <template v-slot:body-cell-result="props">
              <q-td :props="props">
                <q-badge :color="props.row.result === 'VICTORY' ? 'positive' : 'negative'">
                  {{ props.row.result }}
                </q-badge>
              </q-td>
            </template>
            <template v-slot:body-cell-group="props">
              <q-td :props="props">
                <q-badge :color="getGroupColor(props.row.group)">
                  {{ props.row.group }}
                </q-badge>
              </q-td>
            </template>
            <template v-slot:body-cell-date="props">
              <q-td :props="props">
                {{ formatDate(props.row.date) }}
              </q-td>
            </template>
            <template v-slot:body-cell-score="props">
              <q-td :props="props">
                <span class="text-positive">{{ props.row.teamScore }}</span>
                <span class="text-grey-6"> vs </span>
                <span class="text-negative">{{ props.row.enemyScore }}</span>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </template>

    <!-- Estado vazio -->
    <q-card v-else-if="mainPlayer && selectedTeammates.length > 0" class="q-mb-lg">
      <q-card-section class="text-center q-pa-xl">
        <q-icon name="lucide:search-x" size="64px" color="grey-5" />
        <div class="text-h6 text-grey-7 q-mt-md">Nenhuma partida encontrada</div>
        <div class="text-body2 text-grey-6">
          Os jogadores selecionados não jogaram juntos em nenhuma partida registrada.
        </div>
      </q-card-section>
    </q-card>

    <!-- Instrução inicial -->
    <q-card v-else-if="!mainPlayer" class="q-mb-lg">
      <q-card-section class="text-center q-pa-xl">
        <q-icon name="lucide:users" size="64px" color="grey-5" />
        <div class="text-h6 text-grey-7 q-mt-md">Selecione um jogador principal</div>
        <div class="text-body2 text-grey-6">
          Escolha um jogador principal para ver suas estatísticas com teammates.
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useMatchStats, type GroupType, type TeammateAnalysis } from '../composables/useMatchStats';

const route = useRoute();
const { uniquePlayers, groupStats, getTeammateAnalysis, getFrequentTeammates } = useMatchStats();

const mainPlayer = ref<string | null>(null);
const selectedTeammates = ref<string[]>([]);

// Initialize from route params if available
watch(
  () => route.query,
  (query) => {
    if (query.player && typeof query.player === 'string') {
      mainPlayer.value = query.player;
    }
    if (query.teammates && typeof query.teammates === 'string') {
      selectedTeammates.value = query.teammates.split(',').filter(Boolean);
    }
  },
  { immediate: true },
);

const availableTeammates = computed(() => {
  if (!mainPlayer.value) return [];
  return uniquePlayers.value.filter((p) => p !== mainPlayer.value);
});

const frequentTeammates = computed(() => {
  if (!mainPlayer.value) return [];
  return getFrequentTeammates(mainPlayer.value, 2);
});

const teammateAnalysis = computed<TeammateAnalysis | null>(() => {
  if (!mainPlayer.value || selectedTeammates.value.length === 0) return null;
  return getTeammateAnalysis(mainPlayer.value, selectedTeammates.value);
});

const getTeamLabel = computed(() => {
  if (!teammateAnalysis.value) return '';
  const players = [teammateAnalysis.value.mainPlayer, ...teammateAnalysis.value.teammates];
  return players.join(' + ');
});

function toggleTeammate(nickname: string) {
  const idx = selectedTeammates.value.indexOf(nickname);
  if (idx >= 0) {
    selectedTeammates.value.splice(idx, 1);
  } else {
    selectedTeammates.value.push(nickname);
  }
}

function getGroupColor(group: GroupType): string {
  switch (group) {
    case 'SOLO':
      return 'blue-grey';
    case 'DUO':
      return 'purple';
    case 'TRIO':
      return 'orange';
    case 'FULL_SQUAD':
      return 'green';
    default:
      return 'grey';
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    // hour: '2-digit',
    // minute: '2-digit',
  });
}

const playerColumns = [
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
    label: 'K/Partida',
    field: 'avgKills',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'avgDeaths',
    label: 'D/Partida',
    field: 'avgDeaths',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'avgAssists',
    label: 'A/Partida',
    field: 'avgAssists',
    align: 'center' as const,
    sortable: true,
  },
  { name: 'avgRatio', label: 'Ratio', field: 'avgRatio', align: 'center' as const, sortable: true },
  {
    name: 'avgGold',
    label: 'Gold Médio',
    field: 'avgGold',
    align: 'center' as const,
    sortable: true,
  },
  { name: 'mvpCount', label: 'MVPs', field: 'mvpCount', align: 'center' as const, sortable: true },
];

const matchColumns = [
  { name: 'date', label: 'Data', field: 'date', align: 'left' as const, sortable: true },
  { name: 'group', label: 'Grupo', field: 'group', align: 'center' as const, sortable: true },
  { name: 'result', label: 'Resultado', field: 'result', align: 'center' as const, sortable: true },
  {
    name: 'duration',
    label: 'Duração',
    field: 'duration',
    align: 'center' as const,
    sortable: true,
  },
  { name: 'score', label: 'Score', field: 'teamScore', align: 'center' as const },
];

// Reset teammates when main player changes
watch(mainPlayer, () => {
  selectedTeammates.value = [];
});
</script>

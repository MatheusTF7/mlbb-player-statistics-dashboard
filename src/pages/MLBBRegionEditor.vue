<template>
  <div class="q-pa-md">
    <!-- Cabeçalho -->
    <div class="q-mb-lg">
      <h4 class="text-h4 q-my-none">MLBB Region Editor</h4>
      <p class="text-body2 text-grey-7 q-mt-sm">
        Editor de regiões para extração de dados de screenshots do Mobile Legends
      </p>
    </div>

    <!-- Controles de Imagem e Perfil -->
    <q-card class="q-mb-md" flat bordered>
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="image" class="q-mr-sm" />
          Configuração
        </div>

        <div class="row q-col-gutter-md">
          <!-- Seleção de Perfil -->
          <div class="col-12 col-md-4">
            <q-select
              v-model="activeProfileName"
              :options="profileOptions"
              label="Perfil Ativo"
              outlined
              dense
              emit-value
              map-options
            >
              <template v-slot:append>
                <q-btn flat dense icon="add" color="primary" @click="showNewProfileDialog = true">
                  <q-tooltip>Novo Perfil</q-tooltip>
                </q-btn>
              </template>
            </q-select>
          </div>

          <!-- URL da Imagem -->
          <div class="col-12 col-md-5">
            <q-input
              v-model="imageUrl"
              label="URL da Imagem de Referência"
              placeholder="https://exemplo.com/screenshot.jpg"
              outlined
              dense
              @keyup.enter="loadImage"
            >
              <template v-slot:append>
                <q-btn
                  flat
                  dense
                  icon="download"
                  color="primary"
                  @click="loadImage"
                  :disable="!imageUrl"
                >
                  <q-tooltip>Carregar Imagem</q-tooltip>
                </q-btn>
              </template>
            </q-input>
          </div>

          <!-- Upload de Arquivo -->
          <div class="col-12 col-md-3">
            <q-file
              v-model="imageFile"
              label="Ou fazer upload"
              outlined
              dense
              accept="image/*"
              @update:model-value="handleFileUpload"
            >
              <template v-slot:prepend>
                <q-icon name="upload" />
              </template>
            </q-file>
          </div>
        </div>

        <!-- Informações do Perfil -->
        <div v-if="currentProfile" class="row q-col-gutter-md q-mt-sm">
          <div class="col-12 col-md-4">
            <q-input
              v-model="currentProfile.description"
              label="Descrição do Perfil"
              outlined
              dense
            />
          </div>
          <div class="col-6 col-md-2">
            <q-input
              v-model.number="currentProfile.reference_width"
              type="number"
              label="Largura Ref."
              outlined
              dense
              suffix="px"
            />
          </div>
          <div class="col-6 col-md-2">
            <q-input
              v-model.number="currentProfile.reference_height"
              type="number"
              label="Altura Ref."
              outlined
              dense
              suffix="px"
            />
          </div>
        </div>

        <!-- Botões de Ação -->
        <div class="row q-col-gutter-sm q-mt-md">
          <div class="col-auto">
            <q-btn
              color="primary"
              label="Exportar JSON"
              icon="download"
              @click="exportData"
              :disable="!configData.profiles.length"
              unelevated
            />
          </div>
          <div class="col-auto">
            <q-btn
              outline
              color="primary"
              label="Importar JSON"
              icon="upload"
              @click="showImportDialog = true"
              unelevated
            />
          </div>
          <div class="col-auto">
            <q-btn
              color="negative"
              label="Limpar Perfil"
              icon="delete"
              @click="clearCurrentProfile"
              :disable="!currentProfile"
              outline
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Editor de Áreas -->
    <div v-if="imageSrc" class="disable-cursor-events">
      <!-- Seleção da região a editar -->
      <q-card class="q-mb-md" flat bordered>
        <q-card-section>
          <div class="text-subtitle1 q-mb-sm">
            <q-icon name="ads_click" class="q-mr-sm" />
            Região Selecionada para Edição
          </div>

          <div class="row q-col-gutter-md items-center">
            <div class="col-12 col-md-4">
              <q-select
                v-model="selectedRegionKey"
                :options="regionOptions"
                label="Selecionar Região"
                outlined
                dense
                emit-value
                map-options
                clearable
              />
            </div>

            <div class="col-auto">
              <q-btn
                color="primary"
                :label="selectedRegionKey ? 'Redesenhar Região' : 'Desenhar Nova Região'"
                icon="edit"
                :disable="!selectedRegionKey"
                @click="startDrawingMode"
                unelevated
              />
            </div>

            <div class="col-auto" v-if="isDrawingMode">
              <q-chip color="warning" text-color="dark" icon="info">
                Clique e arraste na imagem para definir a região
              </q-chip>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div class="row justify-center">
        <!-- Container da imagem com áreas -->
        <div
          ref="imageContainer"
          style="position: relative; display: inline-block"
          @mousedown="isDrawingMode ? startDraw($event) : null"
          @mousemove="handleMouseMove"
          @mouseup="handleMouseUp"
        >
          <!-- Imagem base -->
          <img
            :src="imageSrc"
            alt="screenshot"
            ref="imageRef"
            style="max-width: 100%; display: block"
            @load="updateDimensions"
          />

          <!-- Regiões Globais -->
          <div
            v-for="(region, key) in globalRegions"
            :key="key"
            class="region-box"
            :class="{
              'region-selected': selectedRegionKey === key,
              'region-hover': hoveredRegion === key,
            }"
            :style="regionStyle(region)"
            @mouseenter="hoveredRegion = key as string"
            @mouseleave="hoveredRegion = null"
            @click.stop="selectRegion(key as string)"
            @mousedown.stop="
              editMode && selectedRegionKey === key ? startMove($event, key as string) : null
            "
          >
            <span class="region-label">{{ regionLabels[key] || key }}</span>

            <!-- Handles de redimensionamento -->
            <template v-if="editMode && selectedRegionKey === key">
              <div
                v-for="h in handles"
                :key="h"
                class="handle"
                :class="h"
                @mousedown.stop.prevent="startResize($event, key as string, h)"
              />
            </template>
          </div>

          <!-- Regiões de Jogadores -->
          <template v-if="currentProfile?.players">
            <template
              v-for="(player, playerIndex) in currentProfile.players"
              :key="'player-' + playerIndex"
            >
              <div
                v-for="(region, regionKey) in player"
                :key="`player-${playerIndex}-${regionKey}`"
                class="region-box player-region"
                :class="{
                  'region-selected': selectedRegionKey === `players.${playerIndex}.${regionKey}`,
                  'region-hover': hoveredRegion === `players.${playerIndex}.${regionKey}`,
                }"
                :style="regionStyle(region as Region)"
                @mouseenter="hoveredRegion = `players.${playerIndex}.${regionKey}`"
                @mouseleave="hoveredRegion = null"
                @click.stop="selectRegion(`players.${playerIndex}.${regionKey}`)"
                @mousedown.stop="
                  editMode && selectedRegionKey === `players.${playerIndex}.${regionKey}`
                    ? startMove($event, `players.${playerIndex}.${regionKey}`)
                    : null
                "
              >
                <span v-if="showAllRegions" class="region-label"
                  >P{{ playerIndex + 1 }}.{{ regionKey }}</span
                >

                <!-- Handles de redimensionamento -->
                <template
                  v-if="editMode && selectedRegionKey === `players.${playerIndex}.${regionKey}`"
                >
                  <div
                    v-for="h in handles"
                    :key="h"
                    class="handle"
                    :class="h"
                    @mousedown.stop.prevent="
                      startResize($event, `players.${playerIndex}.${regionKey}`, h)
                    "
                  />
                </template>
              </div>
            </template>
          </template>

          <!-- Área sendo desenhada (preview) -->
          <div
            v-if="currentDrawing"
            class="region-box drawing"
            :style="regionStyle(currentDrawing)"
          />
        </div>
      </div>

      <div class="row justify-center q-mt-md q-gutter-md">
        <div class="q-mt-xs text-caption text-grey-6" v-if="imageSrc">
          {{ resolutionText }}
        </div>
      </div>
      <!-- Controles de modo -->
      <div class="row justify-center q-gutter-md">
        <q-toggle v-model="editMode" label="Modo edição (mover/redimensionar)" color="primary" />
        <q-toggle v-model="showAllRegions" label="Mostrar legendas" color="secondary" />
      </div>
    </div>

    <!-- Mensagem quando não há imagem -->
    <q-card v-else flat bordered class="text-center q-pa-xl">
      <q-icon name="hide_image" size="64px" color="grey-5" />
      <p class="text-h6 text-grey-6 q-mt-md">Nenhuma imagem carregada</p>
      <p class="text-body2 text-grey-5">
        Adicione uma URL de screenshot ou faça upload para começar a editar as regiões
      </p>
    </q-card>

    <!-- Painel de Regiões -->
    <q-card v-if="currentProfile" class="q-mt-md" flat bordered>
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="layers" class="q-mr-sm" />
          Regiões do Perfil
        </div>

        <!-- Regiões Globais -->
        <div class="text-subtitle2 q-mb-sm">Regiões Globais</div>
        <div class="row q-col-gutter-sm q-mb-md">
          <div v-for="(region, key) in globalRegions" :key="key" class="col-12 col-md-6 col-lg-3">
            <q-card
              flat
              bordered
              :class="{ 'bg-primary-1': selectedRegionKey === key }"
              class="cursor-pointer"
              @click="selectRegion(key as string)"
            >
              <q-card-section class="q-pa-sm">
                <div class="text-weight-medium">{{ regionLabels[key] || key }}</div>
                <div v-if="region" class="text-caption text-grey-6">
                  x: {{ region.x.toFixed(2) }}% | y: {{ region.y.toFixed(2) }}%
                  <br />
                  w: {{ region.w.toFixed(2) }}% | h: {{ region.h.toFixed(2) }}%
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Regiões de Jogadores -->
        <div class="text-subtitle2 q-mb-sm">
          Jogadores ({{ currentProfile.players?.length || 0 }})
          <q-btn flat dense size="sm" icon="add" color="primary" @click="addPlayer" class="q-ml-sm">
            <q-tooltip>Adicionar Jogador</q-tooltip>
          </q-btn>
        </div>

        <q-expansion-item
          v-for="(player, index) in currentProfile.players"
          :key="'player-panel-' + index"
          :label="`Jogador ${index + 1}`"
          icon="person"
          dense
          separator
          header-class="custom-bg"
          class="q-mb-sm"
        >
          <q-card>
            <q-card-section class="q-pa-sm">
              <div class="row q-col-gutter-sm">
                <div v-for="(region, regionKey) in player" :key="regionKey" class="col-6 col-md-3">
                  <q-card
                    flat
                    bordered
                    :class="{
                      'bg-primary-1': selectedRegionKey === `players.${index}.${regionKey}`,
                    }"
                    class="cursor-pointer"
                    @click="selectRegion(`players.${index}.${regionKey}`)"
                  >
                    <q-card-section class="q-pa-xs">
                      <div class="text-weight-medium text-caption">{{ regionKey }}</div>
                      <div v-if="region" class="text-caption text-grey-6" style="font-size: 10px">
                        x: {{ region.x.toFixed(2) }}% | y: {{ region.y.toFixed(2) }}%
                        <br />
                        w: {{ region.w.toFixed(2) }}% | h: {{ region.h.toFixed(2) }}%
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>

              <div class="row justify-end q-mt-sm">
                <q-btn
                  flat
                  dense
                  size="sm"
                  icon="content_copy"
                  color="primary"
                  @click="duplicatePlayer(index)"
                >
                  <q-tooltip>Duplicar Jogador</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  size="sm"
                  icon="delete"
                  color="negative"
                  @click="removePlayer(index)"
                  :disable="(currentProfile.players?.length || 0) <= 1"
                >
                  <q-tooltip>Remover Jogador</q-tooltip>
                </q-btn>
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-card-section>
    </q-card>

    <!-- Dialog para Novo Perfil -->
    <q-dialog v-model="showNewProfileDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Novo Perfil</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="newProfileName"
            label="Nome do Perfil"
            placeholder="ex: meu_perfil_1920x1080"
            outlined
            dense
            class="q-mb-md"
          />
          <q-input
            v-model="newProfileDescription"
            label="Descrição"
            placeholder="Descrição do perfil"
            outlined
            dense
            class="q-mb-md"
          />
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input
                v-model.number="newProfileWidth"
                type="number"
                label="Largura de Referência"
                outlined
                dense
                suffix="px"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model.number="newProfileHeight"
                type="number"
                label="Altura de Referência"
                outlined
                dense
                suffix="px"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            flat
            label="Criar"
            color="primary"
            @click="createNewProfile"
            :disable="!newProfileName"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog de Importação -->
    <q-dialog v-model="showImportDialog">
      <q-card style="min-width: 500px; max-width: 700px">
        <q-card-section>
          <div class="text-h6">Importar Configuração JSON</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-input
            v-model="importJson"
            type="textarea"
            label="Cole o JSON aqui"
            outlined
            rows="12"
            placeholder='{"tesseract_cmd": null, "profiles": [...], ...}'
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn flat label="Importar" color="primary" @click="importData" :disable="!importJson" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog de Visualização JSON -->
    <q-dialog v-model="showJsonDialog">
      <q-card style="min-width: 500px; max-width: 800px">
        <q-card-section>
          <div class="text-h6">Configuração JSON</div>
        </q-card-section>

        <q-separator />

        <q-card-section style="max-height: 60vh; overflow: auto">
          <pre
            class="q-pa-sm bg-grey-1"
            style="white-space: pre-wrap; word-break: break-word; font-size: 12px"
            >{{ JSON.stringify(configData, null, 2) }}</pre
          >
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Copiar JSON"
            color="secondary"
            @click="copyJsonToClipboard"
            icon="content_copy"
          />
          <q-btn flat label="Fechar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { Notify, copyToClipboard } from 'quasar';
import regionConfig from '../data/region_config.json';
import defaultImgRegionConfig from '../assets/default_region_img.jpeg';

// ==================== Interfaces ====================

interface Region {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface PlayerRegions {
  nickname: Region;
  stats: Region;
  medal: Region;
  ratio: Region;
}

interface Profile {
  name: string;
  description: string;
  reference_width: number;
  reference_height: number;
  result_region: Region;
  my_team_score_region: Region;
  adversary_score_region: Region;
  duration_region: Region;
  players: PlayerRegions[];
}

interface ConfigData {
  tesseract_cmd: string | null;
  output_dir: string;
  active_profile: string;
  profiles: Profile[];
}

// ==================== Refs ====================

const imageRef = ref<HTMLImageElement>();
const imageContainer = ref<HTMLDivElement>();

// ==================== Estado Reativo ====================

// Configuração completa
const configData = ref<ConfigData>({
  tesseract_cmd: null,
  output_dir: 'output',
  active_profile: '',
  profiles: [],
});

// Estado da imagem
const imageUrl = ref<string>('');
const imageFile = ref<File | null>(null);
const imageSrc = ref<string>('');
const imgWidth = ref<number>(0);
const imgHeight = ref<number>(0);
const naturalWidth = ref<number | null>(null);
const naturalHeight = ref<number | null>(null);

// Perfil ativo
const activeProfileName = ref<string>('');

// Controles de edição
const editMode = ref<boolean>(true);
const showAllRegions = ref<boolean>(true);
const isDrawingMode = ref<boolean>(false);
const selectedRegionKey = ref<string | null>(null);
const hoveredRegion = ref<string | null>(null);

// Estado de desenho
const drawingStart = ref<{ x: number; y: number } | null>(null);
const currentDrawing = ref<Region | null>(null);

// Estado de interação
const resizing = ref<{ key: string; handle: string } | null>(null);
const moving = ref<{ key: string; startX: number; startY: number; startRegion: Region } | null>(
  null,
);
const handles = ref<string[]>(['tl', 'tr', 'bl', 'br', 'tm', 'bm', 'ml', 'mr']);
const startX = ref<number>(0);
const startY = ref<number>(0);
const startRegion = ref<Region | null>(null);

// Diálogos
const showImportDialog = ref(false);
const showJsonDialog = ref(false);
const showNewProfileDialog = ref(false);
const importJson = ref<string>('');

// Novo perfil
const newProfileName = ref('');
const newProfileDescription = ref('');
const newProfileWidth = ref(1920);
const newProfileHeight = ref(1080);

// Labels para regiões
const regionLabels: Record<string, string> = {
  result_region: 'Resultado',
  my_team_score_region: 'Placar Meu Time',
  adversary_score_region: 'Placar Adversário',
  duration_region: 'Duração',
};

// ==================== Computed ====================

const profileOptions = computed(() => {
  return configData.value.profiles.map((p) => ({
    label: p.name,
    value: p.name,
  }));
});

const currentProfile = computed(() => {
  return configData.value.profiles.find((p) => p.name === activeProfileName.value);
});

const globalRegions = computed<Record<string, Region>>(() => {
  if (!currentProfile.value) return {};
  const profile = currentProfile.value;
  const regions: Record<string, Region> = {};

  if (profile.result_region) regions.result_region = profile.result_region;
  if (profile.my_team_score_region) regions.my_team_score_region = profile.my_team_score_region;
  if (profile.adversary_score_region)
    regions.adversary_score_region = profile.adversary_score_region;
  if (profile.duration_region) regions.duration_region = profile.duration_region;

  return regions;
});

const regionOptions = computed(() => {
  const options: { label: string; value: string }[] = [];

  // Regiões globais
  Object.keys(globalRegions.value).forEach((key) => {
    options.push({
      label: regionLabels[key] || key,
      value: key,
    });
  });

  // Regiões de jogadores
  if (currentProfile.value?.players) {
    currentProfile.value.players.forEach((player, index) => {
      Object.keys(player).forEach((regionKey) => {
        options.push({
          label: `Jogador ${index + 1} - ${regionKey}`,
          value: `players.${index}.${regionKey}`,
        });
      });
    });
  }

  return options;
});

// ==================== Watchers ====================

watch(activeProfileName, (newName) => {
  configData.value.active_profile = newName;
});

// Ao montar, carregar o default.json se não houver configurações
onMounted(() => {
  try {
    const data = regionConfig as ConfigData;

    if (
      (!configData.value.profiles || configData.value.profiles.length === 0) &&
      data?.profiles?.length
    ) {
      configData.value = data;
    }

    if (defaultImgRegionConfig) {
      imageSrc.value = defaultImgRegionConfig;
      imageFile.value = new File([defaultImgRegionConfig], 'default_region_img.jpeg');
      imageUrl.value = 'default_region_img.jpeg';
    }

    // Definir perfil ativo se ainda não estiver definido
    if (!activeProfileName.value) {
      if (
        configData.value.active_profile &&
        configData.value.profiles.some((p) => p.name === configData.value.active_profile)
      ) {
        activeProfileName.value = configData.value.active_profile;
      } else if (configData.value.profiles.length > 0 && configData.value.profiles[0]) {
        activeProfileName.value = configData.value.profiles[0].name;
      }
    }
  } catch (err) {
    // não-fatal: apenas logar
    console.warn('Erro ao carregar regionConfig:', err);
  }
});

// ==================== Métodos de Imagem ====================

const loadImage = () => {
  if (!imageUrl.value) {
    Notify.create({
      type: 'warning',
      message: 'Por favor, insira uma URL válida',
      position: 'top',
    });
    return;
  }

  imageSrc.value = imageUrl.value;
  Notify.create({
    type: 'positive',
    message: 'Imagem carregada com sucesso',
    position: 'top',
  });
};

const handleFileUpload = (file: File | null) => {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result) {
      imageSrc.value = e.target.result as string;
      imageUrl.value = file.name;
      Notify.create({
        type: 'positive',
        message: 'Imagem carregada com sucesso',
        position: 'top',
      });
    }
  };
  reader.readAsDataURL(file);
};

const updateDimensions = () => {
  if (!imageRef.value) return;
  imgWidth.value = imageRef.value.width;
  imgHeight.value = imageRef.value.height;
  naturalWidth.value = imageRef.value.naturalWidth || null;
  naturalHeight.value = imageRef.value.naturalHeight || null;
};

const resolutionText = computed(() => {
  const nat =
    naturalWidth.value && naturalHeight.value
      ? `${naturalWidth.value}×${naturalHeight.value}`
      : '—';
  const disp = `${Math.round(imgWidth.value)}×${Math.round(imgHeight.value)}`;
  return `Natural: ${nat} • Exibida: ${disp}`;
});

// ==================== Métodos de Região ====================

const getRegionByKey = (key: string): Region | null => {
  if (!currentProfile.value) return null;

  // Região global
  if (key in globalRegions.value) {
    const region = globalRegions.value[key];
    return region || null;
  }

  // Região de jogador (formato: players.INDEX.FIELD)
  const playerMatch = key.match(/^players\.(\d+)\.(\w+)$/);
  if (playerMatch && playerMatch[1] && playerMatch[2]) {
    const playerIndex = parseInt(playerMatch[1]);
    const fieldKey = playerMatch[2] as keyof PlayerRegions;
    const player = currentProfile.value.players?.[playerIndex];
    if (player && fieldKey in player) {
      return player[fieldKey];
    }
  }

  return null;
};

const setRegionByKey = (key: string, region: Region) => {
  if (!currentProfile.value) return;

  // Região global
  if (key === 'result_region') {
    currentProfile.value.result_region = region;
  } else if (key === 'my_team_score_region') {
    currentProfile.value.my_team_score_region = region;
  } else if (key === 'adversary_score_region') {
    currentProfile.value.adversary_score_region = region;
  } else if (key === 'duration_region') {
    currentProfile.value.duration_region = region;
  } else {
    // Região de jogador
    const playerMatch = key.match(/^players\.(\d+)\.(\w+)$/);
    if (playerMatch && playerMatch[1] && playerMatch[2]) {
      const playerIndex = parseInt(playerMatch[1]);
      const fieldKey = playerMatch[2] as keyof PlayerRegions;
      const player = currentProfile.value.players?.[playerIndex];
      if (player && fieldKey in player) {
        player[fieldKey] = region;
      }
    }
  }
};

const selectRegion = (key: string) => {
  selectedRegionKey.value = key;
  isDrawingMode.value = false;
};

const startDrawingMode = () => {
  if (!selectedRegionKey.value) return;
  isDrawingMode.value = true;
};

// ==================== Métodos de Desenho ====================

const startDraw = (e: MouseEvent) => {
  if (!isDrawingMode.value || !imageRef.value || !selectedRegionKey.value) return;

  const rect = imageRef.value.getBoundingClientRect();
  drawingStart.value = {
    x: ((e.clientX - rect.left) / imgWidth.value) * 100,
    y: ((e.clientY - rect.top) / imgHeight.value) * 100,
  };
  currentDrawing.value = {
    x: drawingStart.value.x,
    y: drawingStart.value.y,
    w: 0,
    h: 0,
  };
};

const handleMouseMove = (e: MouseEvent) => {
  if (resizing.value) {
    doResize(e);
    return;
  }
  if (moving.value) {
    doMove(e);
    return;
  }
  if (isDrawingMode.value && drawingStart.value && currentDrawing.value && imageRef.value) {
    const rect = imageRef.value.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / imgWidth.value) * 100;
    let y = ((e.clientY - rect.top) / imgHeight.value) * 100;

    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    currentDrawing.value.w = Math.abs(x - drawingStart.value.x);
    currentDrawing.value.h = Math.abs(y - drawingStart.value.y);
    currentDrawing.value.x = Math.min(x, drawingStart.value.x);
    currentDrawing.value.y = Math.min(y, drawingStart.value.y);
  }
};

const handleMouseUp = () => {
  if (resizing.value) {
    resizing.value = null;
    return;
  }
  if (moving.value) {
    moving.value = null;
    return;
  }

  if (isDrawingMode.value && currentDrawing.value && selectedRegionKey.value) {
    if (currentDrawing.value.w > 0.5 && currentDrawing.value.h > 0.5) {
      setRegionByKey(selectedRegionKey.value, { ...currentDrawing.value });
      Notify.create({
        type: 'positive',
        message: `Região "${selectedRegionKey.value}" atualizada`,
        position: 'top',
      });
    }
    currentDrawing.value = null;
    drawingStart.value = null;
    isDrawingMode.value = false;
  }
};

// ==================== Métodos de Redimensionamento ====================

const startResize = (e: MouseEvent, key: string, handle: string) => {
  const region = getRegionByKey(key);
  if (!region) return;

  resizing.value = { key, handle };
  startX.value = e.clientX;
  startY.value = e.clientY;
  startRegion.value = { ...region };
};

const doResize = (e: MouseEvent) => {
  if (!resizing.value || !startRegion.value) return;

  const dx = ((e.clientX - startX.value) / imgWidth.value) * 100;
  const dy = ((e.clientY - startY.value) / imgHeight.value) * 100;
  const region = { ...startRegion.value };

  switch (resizing.value.handle) {
    case 'tl':
      region.x = startRegion.value.x + dx;
      region.y = startRegion.value.y + dy;
      region.w = startRegion.value.w - dx;
      region.h = startRegion.value.h - dy;
      break;
    case 'tr':
      region.y = startRegion.value.y + dy;
      region.w = startRegion.value.w + dx;
      region.h = startRegion.value.h - dy;
      break;
    case 'bl':
      region.x = startRegion.value.x + dx;
      region.w = startRegion.value.w - dx;
      region.h = startRegion.value.h + dy;
      break;
    case 'br':
      region.w = startRegion.value.w + dx;
      region.h = startRegion.value.h + dy;
      break;
    case 'tm':
      region.y = startRegion.value.y + dy;
      region.h = startRegion.value.h - dy;
      break;
    case 'bm':
      region.h = startRegion.value.h + dy;
      break;
    case 'ml':
      region.x = startRegion.value.x + dx;
      region.w = startRegion.value.w - dx;
      break;
    case 'mr':
      region.w = startRegion.value.w + dx;
      break;
  }

  // Normalizar coordenadas negativas
  if (region.w < 0) {
    region.x += region.w;
    region.w *= -1;
  }
  if (region.h < 0) {
    region.y += region.h;
    region.h *= -1;
  }

  // Limitar entre 0% e 100%
  region.x = Math.max(0, Math.min(region.x, 100));
  region.y = Math.max(0, Math.min(region.y, 100));
  if (region.x + region.w > 100) region.w = 100 - region.x;
  if (region.y + region.h > 100) region.h = 100 - region.y;

  setRegionByKey(resizing.value.key, region);
};

// ==================== Métodos de Movimentação ====================

const startMove = (e: MouseEvent, key: string) => {
  if (resizing.value) return;
  const region = getRegionByKey(key);
  if (!region) return;

  moving.value = {
    key,
    startX: e.clientX,
    startY: e.clientY,
    startRegion: { ...region },
  };
};

const doMove = (e: MouseEvent) => {
  if (!moving.value) return;

  const dx = ((e.clientX - moving.value.startX) / imgWidth.value) * 100;
  const dy = ((e.clientY - moving.value.startY) / imgHeight.value) * 100;
  const region = { ...moving.value.startRegion };

  region.x = moving.value.startRegion.x + dx;
  region.y = moving.value.startRegion.y + dy;

  // Impedir que saia dos limites
  region.x = Math.max(0, Math.min(100 - region.w, region.x));
  region.y = Math.max(0, Math.min(100 - region.h, region.y));

  setRegionByKey(moving.value.key, region);
};

// ==================== Métodos de Estilo ====================

const regionStyle = (region: Region) => {
  return {
    left: `${region.x}%`,
    top: `${region.y}%`,
    width: `${region.w}%`,
    height: `${region.h}%`,
  };
};

// ==================== Operações de Perfil ====================

const createNewProfile = () => {
  const newProfile: Profile = {
    name: newProfileName.value,
    description: newProfileDescription.value,
    reference_width: newProfileWidth.value,
    reference_height: newProfileHeight.value,
    result_region: { x: 40, y: 3, w: 20, h: 10 },
    my_team_score_region: { x: 32, y: 5, w: 5, h: 8 },
    adversary_score_region: { x: 62, y: 5, w: 5, h: 8 },
    duration_region: { x: 77, y: 11, w: 5, h: 4 },
    players: [createDefaultPlayer()],
  };

  configData.value.profiles.push(newProfile);
  activeProfileName.value = newProfile.name;
  showNewProfileDialog.value = false;

  // Reset form
  newProfileName.value = '';
  newProfileDescription.value = '';
  newProfileWidth.value = 1920;
  newProfileHeight.value = 1080;

  Notify.create({
    type: 'positive',
    message: 'Perfil criado com sucesso',
    position: 'top',
  });
};

const createDefaultPlayer = (): PlayerRegions => ({
  nickname: { x: 21, y: 22, w: 10, h: 4 },
  stats: { x: 31, y: 22, w: 12, h: 4 },
  medal: { x: 43, y: 22, w: 4, h: 7 },
  ratio: { x: 43, y: 29, w: 4, h: 4 },
});

const addPlayer = () => {
  if (!currentProfile.value) return;

  if (!currentProfile.value.players) {
    currentProfile.value.players = [];
  }

  // Copiar último jogador ou criar padrão
  const lastPlayer = currentProfile.value.players[currentProfile.value.players.length - 1];
  const newPlayer = lastPlayer ? JSON.parse(JSON.stringify(lastPlayer)) : createDefaultPlayer();

  // Ajustar posição Y para baixo
  if (lastPlayer) {
    const yOffset = 12; // Deslocamento vertical
    (Object.keys(newPlayer) as (keyof PlayerRegions)[]).forEach((key) => {
      newPlayer[key].y += yOffset;
    });
  }

  currentProfile.value.players.push(newPlayer);
};

const duplicatePlayer = (index: number) => {
  if (!currentProfile.value?.players) return;

  const player = currentProfile.value.players[index];
  const newPlayer = JSON.parse(JSON.stringify(player));

  // Ajustar posição Y
  const yOffset = 12;
  (Object.keys(newPlayer) as (keyof PlayerRegions)[]).forEach((key) => {
    newPlayer[key].y += yOffset;
  });

  currentProfile.value.players.splice(index + 1, 0, newPlayer);
};

const removePlayer = (index: number) => {
  if (!currentProfile.value?.players) return;
  if (currentProfile.value.players.length <= 1) return;

  currentProfile.value.players.splice(index, 1);
};

const clearCurrentProfile = () => {
  if (!currentProfile.value) return;

  currentProfile.value.result_region = { x: 40, y: 3, w: 20, h: 10 };
  currentProfile.value.my_team_score_region = { x: 32, y: 5, w: 5, h: 8 };
  currentProfile.value.adversary_score_region = { x: 62, y: 5, w: 5, h: 8 };
  currentProfile.value.duration_region = { x: 77, y: 11, w: 5, h: 4 };
  currentProfile.value.players = [createDefaultPlayer()];

  Notify.create({
    type: 'info',
    message: 'Perfil resetado para valores padrão',
    position: 'top',
  });
};

// ==================== Métodos de Exportação/Importação ====================

const exportData = () => {
  const jsonString = JSON.stringify(configData.value, null, 2);

  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `mlbb-config-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  Notify.create({
    type: 'positive',
    message: 'Configuração exportada com sucesso',
    position: 'top',
  });
};

const copyJsonToClipboard = () => {
  const jsonString = JSON.stringify(configData.value, null, 2);

  copyToClipboard(jsonString)
    .then(() => {
      Notify.create({
        type: 'positive',
        message: 'JSON copiado para a área de transferência',
        position: 'top',
      });
    })
    .catch(() => {
      Notify.create({
        type: 'negative',
        message: 'Erro ao copiar JSON',
        position: 'top',
      });
    });
};

const importData = () => {
  try {
    const data = JSON.parse(importJson.value) as ConfigData;

    // Validar estrutura básica
    if (!data.profiles || !Array.isArray(data.profiles)) {
      throw new Error('Estrutura de profiles inválida');
    }

    configData.value = data;

    // Selecionar perfil ativo
    if (data.active_profile && data.profiles.some((p) => p.name === data.active_profile)) {
      activeProfileName.value = data.active_profile;
    } else if (data.profiles.length > 0 && data.profiles[0]) {
      activeProfileName.value = data.profiles[0].name;
    }

    showImportDialog.value = false;
    importJson.value = '';

    Notify.create({
      type: 'positive',
      message: 'Configuração importada com sucesso',
      position: 'top',
    });
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: `Erro ao importar JSON: ${error instanceof Error ? error.message : 'JSON inválido'}`,
      position: 'top',
    });
  }
};
</script>

<style scoped lang="scss">
// Prevenir seleção e arrasto
img {
  border: #333 1px solid;
  pointer-events: none;
}

.disable-cursor-events {
  user-select: none;
  -webkit-user-drag: none;
}

// Regiões (áreas)
.region-box {
  position: absolute;
  border: 2px dashed rgba(255, 0, 0, 0.7);
  background: rgba(255, 0, 0, 0.15);
  cursor: pointer;
  // transition: all 0.15s ease;

  &.player-region {
    border-color: rgba(251, 255, 0, 0.781);
    background: rgba(229, 255, 0, 0.15);
  }

  &.region-selected {
    border-color: rgba(0, 200, 0, 0.9);
    background: rgba(0, 200, 0, 0.25);
    border-width: 3px;
    cursor: move;
    z-index: 10;
  }

  &.region-hover:not(.region-selected) {
    border-color: rgba(255, 165, 0, 0.9);
    background: rgba(255, 165, 0, 0.2);
  }

  &.drawing {
    border: 2px solid rgba(255, 0, 0, 0.9);
    background: rgba(255, 0, 0, 0.3);
    pointer-events: none;
  }
}

.region-label {
  position: absolute;
  top: -20px;
  left: 0;
  font-size: 10px;
  font-weight: bold;
  color: #fff;
  background: rgba(0, 0, 0, 0.7);
  padding: 2px 6px;
  border-radius: 3px;
  white-space: nowrap;
}

// Handles de redimensionamento
.handle {
  width: 10px;
  height: 10px;
  background: #fff;
  border: 2px solid #000;
  position: absolute;
  z-index: 15;
}

.handle.tl {
  top: -6px;
  left: -6px;
  cursor: nwse-resize;
}

.handle.tr {
  top: -6px;
  right: -6px;
  cursor: nesw-resize;
}

.handle.bl {
  bottom: -6px;
  left: -6px;
  cursor: nesw-resize;
}

.handle.br {
  bottom: -6px;
  right: -6px;
  cursor: nwse-resize;
}

.handle.tm {
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  cursor: ns-resize;
}

.handle.bm {
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  cursor: ns-resize;
}

.handle.ml {
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
  cursor: ew-resize;
}

.handle.mr {
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  cursor: ew-resize;
}

// Classes auxiliares
.bg-primary-1 {
  background-color: rgba(var(--q-primary-rgb), 0.1);
}
</style>

<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md items-center">
      <div class="col">
        <q-btn flat icon="lucide:arrow-left" label="Voltar" to="/dashboard" class="q-mb-sm" />
        <h4 class="text-h4 q-my-none">Sobre</h4>
        <p class="text-body2 text-grey-7 q-mt-sm">
          Informações sobre a aplicação e seus objetivos.
        </p>
      </div>
    </div>

    <q-card class="q-pa-md q-mb-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">MLBB Player's Statistics Dashboard</div>
        <div class="text-body1 q-mb-md">
          Esta aplicação foi criada para analisar estatísticas de partidas de Mobile Legends: Bang
          Bang (MLBB) com base em um dataset idealizado. Permite ver estatísticas agregadas por
          jogador, por tipo de grupo (SOLO, DUO, TRIO, FULL) e realizar análises customizadas de
          jogadores que jogaram juntos.
        </div>

        <div class="q-mb-md">
          <div class="text-subtitle2 q-mb-xs">Funcionalidades</div>
          <ul>
            <li>Análise individual de jogadores</li>
            <li>Análise por tipo de grupo (SOLO/DUO/TRIO/FULL)</li>
            <li>Análise de teammates: estatísticas quando um conjunto de jogadores jogam juntos</li>
            <li>Relatórios de MVP, KDA e distribuições de medalhas</li>
          </ul>
        </div>

        <div class="q-mb-md">
          <div class="text-subtitle2 q-mb-xs">Origem dos dados</div>
          <div class="text-body2 q-mb-sm">
            Os dados de exemplo são gerados localmente (dataset de teste) e podem ser substituídos
            por fontes reais conforme necessário. O projeto também inclui ferramentas para gerar
            dados fictícios que estão sendo usados para testes e desenvolvimento.
          </div>
          <div class="text-body2 q-mb-sm">
            Após testes iniciais, o objetivo é integrar um extrator de dados que capture informações
            diretamente de screenshots do jogo, facilitando a coleta de dados reais pelos de
            screenshots enviados pelos próprios usuários.
          </div>
          <div class="text-body2 q-mb-sm">
            O extrator de dados está em desenvolvimento e pode ser encontrado no seguinte
            repositório:
            <a href="https://github.com/MatheusTF7/mlbb-img-data-extractor" target="_blank"
              >https://github.com/MatheusTF7/mlbb-img-data-extractor</a
            >. Sinta-se livre para baixar, testar e contribuir com o projeto! O projeto roda
            localmente, é escrito em Python e utiliza técnicas de visão computacional para
            identificar e extrair os dados relevantes das imagens.
          </div>
        </div>

        <div class="q-mb-md">
          <div class="text-subtitle2 q-mb-xs">Problema e solução proposta</div>
          <div class="text-body2 q-mb-sm">
            O Mobile Legends: Bang Bang (MLBB) não fornece uma API pública para consultar dados de
            partidas por usuário, o que dificulta a obtenção de estatísticas detalhadas. Para
            contornar essa limitação, está em desenvolvimento um
            <strong>extrator de dados baseado em screenshots</strong> das telas finais das partidas.
            Este extrator já funciona de forma parcial e apresenta certa precisão em testes
            iniciais.
          </div>
          <div class="text-body2 q-mb-sm">
            Os dados extraídos (como kills, deaths, assists, medalhas, MVPs, gold e duração) são
            normalizados e usados para alimentar as visualizações desta aplicação, permitindo
            análises que vão além do dashboard nativo do MLBB — por exemplo, contagem de medalhas
            por jogador e comparação de estatísticas quando jogadores jogam juntos.
          </div>
        </div>

        <div>
          <div class="text-subtitle2 q-mb-xs">Contribuidor</div>
          <div class="text-body2">Matheus (MatheusTF7) — repositório e extrator de dados (WIP)</div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat label="Ver Dashboard" to="/dashboard" />
        <q-btn
          flat
          label="Ver código do extrator"
          href="https://github.com/MatheusTF7/mlbb-img-data-extractor"
          target="_blank"
        />
      </q-card-actions>
    </q-card>

    <q-card>
      <q-card-section>
        <div class="text-caption text-grey-6">Versão de desenvolvimento — Fevereiro 2026</div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
// Página informativa simples — sem lógica adicional por enquanto
</script>

<style scoped></style>

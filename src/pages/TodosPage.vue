<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h4 class="text-h4 q-my-none">TODOs / Próximos Passos</h4>
        <p class="text-body2 text-grey-7 q-mt-sm">
          Lista de tarefas e prioridades para próximos trabalhos
        </p>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-8">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-sm">Tarefas</div>
            <q-list bordered>
              <q-item v-for="task in tasks" :key="task.id">
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ task.title }}</q-item-label>
                </q-item-section>
                <q-item-section side class="row items-center">
                  <q-badge :color="badgeColor(task.status)" :label="task.status" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-sm">Ações Rápidas</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12">
                <q-btn
                  label="Marcar tudo como feito"
                  color="positive"
                  @click="markAllCompleted"
                  block
                />
              </div>
              <div class="col-12">
                <q-btn label="Exportar TODOs" color="primary" @click="exportTodos" block />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import tasksData from '../data/todos.json';
import { Notify } from 'quasar';

interface TodoItem {
  id: number;
  title: string;
  status: string;
}

const tasks = ref<TodoItem[]>([]);

onMounted(() => {
  tasks.value = (tasksData as TodoItem[]).slice();
});

function badgeColor(status: string) {
  if (status === 'completed' || status === 'completed') return 'positive';
  if (status === 'in-progress' || status === 'in-progress') return 'amber';
  return 'grey';
}

function markAllCompleted() {
  tasks.value = tasks.value.map((t) => ({ ...t, status: 'completed' }));
  Notify.create({ message: 'Todas as tarefas marcadas como completas', type: 'positive' });
}

function exportTodos() {
  const blob = new Blob([JSON.stringify(tasks.value, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `todos-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  Notify.create({ message: 'TODOs exportados', type: 'positive' });
}
</script>

<style scoped></style>

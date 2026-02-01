<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Quasar App </q-toolbar-title>

        <div>
          <q-btn
            :color="darkMode ? 'yellow' : 'blue-grey-9'"
            :icon="darkMode ? 'dark_mode' : 'light_mode'"
            round
            dense
            flat
            class="q-mr-sm"
            @click="toggleDarkMode"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Essential Links </q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue';
import { useQuasar } from 'quasar';
const $q = useQuasar();

const darkMode = ref($q.dark.isActive);

const linksList: EssentialLinkProps[] = [
  {
    title: 'Region Editor',
    caption: 'Edit MLBB image regions',
    icon: 'image',
    link: '/mlbb',
  },
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function toggleDarkMode() {
  $q.dark.toggle();
  darkMode.value = $q.dark.isActive;
  localStorage.setItem('dark_mode', String($q.dark.isActive));
}

onMounted(() => {
  const savedMode = localStorage.getItem('dark_mode');
  if (savedMode !== null) {
    const isDark = savedMode === 'true';
    if (isDark !== $q.dark.isActive) {
      $q.dark.set(isDark);
      darkMode.value = isDark;
    }
  }
});
</script>

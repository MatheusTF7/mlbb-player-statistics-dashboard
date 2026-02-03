import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },

  {
    path: '/mlbb',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/MLBBRegionEditor.vue') }],
  },

  {
    path: '/dashboard',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/MatchDashboard.vue') }],
  },

  {
    path: '/todos',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/TodosPage.vue') }],
  },

  {
    path: '/player',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/PlayerDetailPage.vue') },
      { path: ':nickname', component: () => import('pages/PlayerDetailPage.vue') },
    ],
  },

  {
    path: '/team',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/TeamAnalysisPage.vue') }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;

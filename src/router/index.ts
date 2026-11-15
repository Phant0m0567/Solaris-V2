import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/games',
      name: 'games',
      component: () => import('@/pages/Games.vue'),
    },
    {
      path: '/cloud/',
      name: 'cloud',
      component: () => import('@/pages/Cloud.vue'),
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('@/pages/Chat.vue'),
    },
    {
      path: '/ai',
      name: 'ai',
      component: () => import('@/pages/AI.vue'),
    }
  ],
})

router.beforeEach((to, from) => {
  if (window.crossOriginIsolated && from.name === 'cloud' && to.name !== 'cloud') {
    window.location.assign(to.fullPath);
    return false;
  }
})

export default router
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path:"/",
      name:'main',
      component:()=>import('../views/main.vue')
    },
    {
      path:"/orb",
      name:'orbtest',
      component:()=>import('../views/testOrb.vue')
    },
    {
      path:"/test",
      name:'test',
      component:()=>import('../views/test.vue')
    }
  ]
})

export default router

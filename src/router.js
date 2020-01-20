import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

import auth from '@/firebase/auth/index'

Vue.use(Router)

export const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('./views/Dashboard.vue'),
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/map/add',
      name: 'map-add',
      component: () => import('./views/MapAdd.vue'),
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/map/:id',
      name: 'map-detail',
      component: () => import('./views/MapDetail.vue'),
      meta: {
        requireAuth: true,
        layout: 'map-layout'
      }
    },
    {
      path: '/map/:id/edit',
      name: 'map-editor',
      component: () => import('./views/MapEditor.vue'),
      meta: {
        requireAuth: true,
        layout: 'map-layout'
      }
    },
    {
      path: '/map/webgl/:id',
      name: 'webglmap-detail',
      component: () => import('./views/webglmap/WebglmapDetail.vue'),
      meta: {
        requireAuth: true,
        layout: 'webglmap-layout'
      }
    },
    {
      path: '/map/webgl/:id/edit',
      name: 'webglmap-editor',
      component: () => import('./views/webglmap/WebglmapEditor.vue'),
      meta: {
        requireAuth: true,
        layout: 'webglmap-layout'
      }
    },
    {
      path: '/sign-in',
      name: 'sign-in',
      component: () => import('./views/SignIn.vue')
    },
    {
      path: '/404',
      name: 'error404',
      component: () => import('./views/Error404.vue')
    },
    {
      path: '*',
      redirect: '/404'
    }
  ]
})

router.beforeEach((to, from, next) => {
  let currentUser = auth.user()
  let requireAuth = to.matched.some(record => record.meta.requireAuth)
  let guestOnly = to.matched.some(record => record.meta.guestOnly)

  if (requireAuth && !currentUser) next('sign-in')
  else if (guestOnly && currentUser) next('dashboard')
  else next()
})

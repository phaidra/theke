import Vue from 'vue'
import Router from 'vue-router'
import Search from '@/components/Search'
import Detail from '@/components/Detail'
import Login from '@/components/Login'
import Manage from '@/components/Manage'
import Edit from '@/components/Edit'
import Submit from '@/components/Submit'
import Contact from '@/components/Contact'
import Impressum from '@/components/Impressum'
import AddMember from '@/components/AddMember'
import Home from '@/components/ext/Home'
import Content from '@/components/ext/Content'
import Usage from '@/components/ext/Usage'
import config from '../config/theke'

Vue.use(Router)

const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/detail/:pid',
    name: 'detail',
    component: Detail
  },
  {
    path: '/edit/:pid',
    name: 'edit',
    component: Edit
  },
  {
    path: '/manage/:pid',
    name: 'manage',
    component: Manage
  },
  {
    path: '/submit',
    name: 'submit',
    component: Submit
  },
  {
    path: '/addmember/:pid',
    name: 'addmember',
    component: AddMember
  },
  {
    path: '/contact',
    name: 'contact',
    component: Contact
  },
  {
    path: '/impressum',
    name: 'impressum',
    component: Impressum
  }
]

if (config.global.homepage) {
  routes.push(
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/search',
      name: 'search',
      component: Search
    }
  )
} else {
  routes.push(
    {
      path: '/',
      name: 'search',
      component: Search
    }
  )
}

if (config.global.contentpage) {
  routes.push(
    {
      path: '/content',
      name: 'content',
      component: Content
    }
  )
}

if (config.global.usagepage) {
  routes.push(
    {
      path: '/usage',
      name: 'usage',
      component: Usage
    }
  )
}

export default new Router({
  routes,
  scrollBehavior () {
    return { x: 0, y: 0 }
  }
})

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

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'search',
      component: Search
    },
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
  ],
  scrollBehavior () {
    return { x: 0, y: 0 }
  }
})

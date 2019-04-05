import Vue from 'vue'
import Router from 'vue-router'
import Search from '@/components/Search'
import Detail from '@/components/Detail'
import Edit from '@/components/Edit'
import Submit from '@/components/Submit'
import Contact from '@/components/Contact'
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
  ]
})

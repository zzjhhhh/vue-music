import Vue from "vue";
import Router from "vue-router";
import Rank from "@/components/rank/rank.vue";
import Recommend from "@/components/recommend/recommend.vue";
import Singer from "@/components/singer/singer.vue";
import Search from "@/components/search/search.vue";
import SingerDetail from "@/components/singer-detail/singer-detail.vue";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      redirect: "/recommend"
    },
    {
      path: "/recommend",
      component: Recommend
    },
    {
      path: "/singer",
      component: Singer,
      children: [
        {
          path: ":id",
          component: SingerDetail
        }
      ]
    },
    {
      path: "/search",
      component: Search
    },
    {
      path: "/rank",
      component: Rank
    }
  ]
});

<template>
  <scroll
    class="listview"
    :data="data"
    ref="listview"
    :listenScroll="listenScroll"
    :probeType="probeType"
    @scroll="scroll"
  >
    <ul @touchmove.prevent>
      <li v-for="group in data" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{ group.title }}</h2>
        <ul>
          <li
            @click="selectItem(item)"
            v-for="item in group.items"
            :key="item.id"
            class="list-group-item"
          >
            <img class="avatar" v-lazy="item.avatar" />
            <span class="name">{{ item.name }}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div
      class="list-shortcut"
      @touchstart.stop="onShortcutTouchStart"
      @touchmove.stop.prevent="onShortcutTouchMove"
    >
      <ul>
        <li
          v-for="(item, index) in shortcutList"
          class="item"
          :data-index="index"
          :class="{ current: index === currentIndex }"
        >{{ item }}</li>
      </ul>
    </div>
    <div class="list-fixed" v-show="this.scrollY < 0" ref="fixed">
      <h1 class="fixed-title">{{ fixedTitle }}</h1>
    </div>
    <div v-show="!data.length" class="loading-container">
      <loading></loading>
    </div>
  </scroll>
</template>

<script>
import Scroll from "base/scroll/scroll";
import Loading from "base/loading/loading";

const ANCHOR_HEIGHT = 18;
const TITLE_HEIGHT = 30;

export default {
  created() {
    this.touch = {};
    this.listenScroll = true;
    this.listHeight = [];
    this.probeType = 3;
  },
  data() {
    return {
      scrollY: -1,
      currentIndex: 0,
      diff: 0
    };
  },
  props: {
    data: {
      type: Array,
      default: []
    }
  },
  computed: {
    shortcutList() {
      return this.data.map(group => {
        return group.title.substring(0, 1);
      });
    },
    fixedTitle() {
      return this.data.length > 0 ? this.data[this.currentIndex].title : "";
    }
  },
  methods: {
    selectItem(item) {
      this.$emit("select", item);
    },
    onShortcutTouchStart(e) {
      let anchorIndex = e.target.getAttribute("data-index");
      let firstTouch = e.touches[0];
      this.touch.y1 = firstTouch.pageY;
      this.touch.anchorIndex = anchorIndex;
      this._scrollTo(anchorIndex);
    },
    onShortcutTouchMove(e) {
      let firstTouch = e.touches[0];
      this.touch.y2 = firstTouch.pageY;
      let delta = ((this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT) | 0;
      let anchorIndex = parseInt(this.touch.anchorIndex) + delta;
      this._scrollTo(anchorIndex);
    },
    scroll(pos) {
      this.scrollY = pos.y;
    },
    _scrollTo(index) {
      this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0);
    },
    _calculateHeight() {
      this.listHeight = [];
      let height = 0;
      this.listHeight.push(height);
      this.$refs.listGroup.forEach(item => {
        height += item.clientHeight;
        this.listHeight.push(height);
      });
    }
  },
  watch: {
    data() {
      setTimeout(() => {
        this._calculateHeight();
      }, 20);
    },
    scrollY(newY) {
      const listHeight = this.listHeight;
      // 当滚动到顶部 newY > 0
      if (-newY < 0) {
        this.currentIndex = 0;
        return;
      }
      // 在中间
      for (let i = 0; i < listHeight.length - 1; i++) {
        let height1 = listHeight[i];
        let height2 = listHeight[i + 1];
        if (-newY >= height1 && -newY < height2) {
          this.currentIndex = i;
          this.diff = height2 + newY;
          return;
        }
      }
      // 底部
      this.currentIndex = listHeight.length - 2;
    },

    diff(newVal) {
      let fixedTop;
      if (newVal > 0 && newVal < TITLE_HEIGHT) {
        fixedTop = newVal - TITLE_HEIGHT;
      } else {
        fixedTop = 0;
      }
      // 减少直接操作 dom 次数
      if (this.fixedTop !== fixedTop) {
        this.fixedTop = fixedTop;
        this.$refs.fixed.style.transform = `translateY(${fixedTop}px)`;
      }
    }
  },
  components: {
    Scroll,
    Loading
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';

.listview {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: $color-background;

  .list-group {
    padding-bottom: 30px;

    .list-group-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }

    .list-group-item {
      display: flex;
      align-items: center;
      padding: 20px 0 0 30px;

      .avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
      }

      .name {
        margin-left: 20px;
        color: $color-text-l;
        font-size: $font-size-medium;
      }
    }
  }

  .list-shortcut {
    position: absolute;
    z-index: 30;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    padding: 20px 0;
    border-radius: 10px;
    text-align: center;
    background: $color-background-d;
    font-family: Helvetica;

    .item {
      padding: 3px;
      line-height: 1;
      color: $color-text-l;
      font-size: $font-size-small;

      &.current {
        color: $color-theme;
      }
    }
  }

  .list-fixed {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;

    .fixed-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }
  }

  .loading-container {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>

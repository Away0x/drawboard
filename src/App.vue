<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import DrawDialog from './components/drawboard/index.vue';
import { DrawDialogSubmitEvent } from './components/drawboard/type';

interface Data {
  img: boolean;
  data: string;
}

@Component({
  components: {
    DrawDialog,
  },
})
export default class App extends Vue {
  /* ------------------------ INPUT & OUTPUT ------------------------ */

  /* ------------------------ VUEX (vuex getter & vuex action) ------------------------ */

  /* ------------------------ LIFECYCLE HOOKS (created & mounted & ...) ------------------------ */

  /* ------------------------ COMPONENT STATE (data & computed & model) ------------------------ */
  private draw_dialog_show = false;
  private draw_dialog_edit: Data | null = null;
  private section1: Data = {
    img: false,
    data: 'ikhojiasldjlasdjoqwhekbsdbkasdbkajwhqoieoqwjennsadad',
  };
  private section2: Data = {
    img: true,
    data: '/images/a.jpg',
  };

  /* ------------------------ WATCH ------------------------ */

  /* ------------------------ METHODS ------------------------ */
  // 批注弹框打开
  private async draw_dialog_open(data: Data) {
    const draw_module = this.$refs.draw as DrawDialog;
    if ( ! draw_module) { return; }

    this.draw_dialog_edit = data;
    this.draw_dialog_show = true;
    draw_module.draw(data.data, data.img);
  }

  // 批注弹框的提交
  private async draw_dialog_submit(payload: DrawDialogSubmitEvent) {
    if (this.draw_dialog_edit) {
      this.draw_dialog_edit.img = true;
      this.draw_dialog_edit.data = payload.base64;
    }
    this.draw_dialog_show = false;
    this.draw_dialog_edit = null;
  }

}
</script>

<template>
  <div id="app">
    <h1>绘制文本</h1>
    <p>
      <template v-if="section1.img">
        <img :src="section1.data" />
      </template>
      <template v-else>
        {{ section1.data }}
      </template>
    </p>
    <el-button style="margin-bottom:20px" size="mini" @click="draw_dialog_open(section1)">批注</el-button>

    <h1>绘制图片</h1>
    <p>
      <template v-if="section2.img">
        <img :src="section2.data" />
      </template>
      <template v-else>
        {{ section2.data }}
      </template>
    </p>
    <el-button size="mini" @click="draw_dialog_open(section2)">批注</el-button>

    <draw-dialog ref="draw"
      :show="draw_dialog_show"
      @close="draw_dialog_show = false"
      @submit="draw_dialog_submit" />

  </div>
</template>

<style lang="stylus">

#app
  padding 20px
  h1
    font-size 20px
    font-weight bolder
    margin-bottom 10px
  p
    margin 20px 0

</style>

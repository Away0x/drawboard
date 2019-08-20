<script lang="ts">
/* COMPONENT DOCUMENT
 * author: wutong
 * date: 2019/08/12
 * desc: 批注弹窗
 */

import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';

import BaseDialog from '../basedialog.vue';
import Drawboard, { DrawMode } from './drawboard';
import { get_img_src_or_url, get_image_natural_wh, confirm_message } from './utils';
import { is_array, network_url_replace_to_root_url } from './utils';
import { DrawDialogSubmitEvent } from './type';
import {
  register_arror_draw,
  register_right_draw,
  register_wrong_draw,
  register_aplus_draw,
  register_aminus_draw,
} from './custom';

const DEFAULT_CANVAS_WG = { width: 1000, height: 450 };
const DEFAULT_MODE = 4; // 默认画笔模式
const DEFAULT_ANGLE = 0; // 默认旋转角度

@Component({
  name: 'draw-dialog',
  components: {
    BaseDialog,
  },
})
export default class DrawDialog extends Vue {
  /* ------------------------ INPUT & OUTPUT ------------------------ */
  @Prop({type: Boolean, default: false}) private show!: boolean;

  /* ------------------------ COMPONENT STATE (data & computed & model) ------------------------ */
  private img_loading = false;
  private DEFAULT_CANVAS_WG = DEFAULT_CANVAS_WG;
  private drawboard: Drawboard | null = null;
  private btn_names = [
    '画框', '画圆', '箭头', '直线', '画笔', '输入',
    '撤销', '清屏', '正确', '错误', 'A+', 'A-', '旋转',
  ];
  private current_button_index = 4;
   // 颜色
  private color = '#FF0000';
  // 处于移动模式
  private in_move_mode = false;
  /** 初始状态 */
  private init_state: {is_img: boolean, data: any} = { is_img: false, data: '' };
  /** 旋转 angle */
  private rotate_angle = DEFAULT_ANGLE;
  /** canvas width & height */
  private canvas_wh = DEFAULT_CANVAS_WG;

  /** 设置文本 */
  public async set_text(text: string | string[] = [''], angle = DEFAULT_ANGLE) {
    await this.reset_canvas();
    if (!this.drawboard) { return; }

    this.drawboard.set_text({
      text: is_array(text) ? (text as string[]) : [text as string],
      left: 15,
      top: 15,
      color: '#000',
      angle,
    });
    this.init_state.is_img = false;
    this.init_state.data = text;
  }

  /** 设置图片 */
  public async set_img(src: string, angle = DEFAULT_ANGLE) {
    this.img_loading = true;
    // const img_src = network_url_replace_to_root_url(get_img_src_or_url(src));
    const img_src = src;

    const set_error_img = () => {
      console.warn('drawing_board load image error ', img_src);
      this.drawboard!.set_text({ text: ['图片加载失败:   ' + img_src], left: 15, top: 15, color: 'red' });
    };
    const finish = () => { this.img_loading = false; };

    try {
      let { width, height } = await get_image_natural_wh(img_src);
      if (width < DEFAULT_CANVAS_WG.width) {
        width = DEFAULT_CANVAS_WG.width;
      }
      if (height < DEFAULT_CANVAS_WG.height) {
        height = DEFAULT_CANVAS_WG.height;
      }

      if (angle === 90 || angle === 270) {
        const tempw = width;
        width = height;
        height = tempw;
      }

      await this.reset_canvas(width, height);
      if (!this.drawboard) {
        finish();
        return;
      }
      this.drawboard!.set_bg_img({ src: img_src, angle, catch: set_error_img, finish });
    } catch (err) {
      this.reset_canvas();
      set_error_img();
      finish();
    }

    this.init_state.is_img = true;
    this.init_state.data = src;
  }

  /** 绘制 */
  public draw(str: string | string[], img = true) {
    if (is_array(str)) {
      this.set_text(str);
      return;
    }
    const s = str as string;

    if (img) {
      this.set_img(s);
      return;
    }

    this.set_text([s]);
  }

  @Emit('close') private close_handler() {}
  @Emit('submit') private submit_handler(payload: DrawDialogSubmitEvent) {}

  /* ------------------------ VUEX (vuex getter & vuex action) ------------------------ */

  /* ------------------------ LIFECYCLE HOOKS (created & mounted & ...) ------------------------ */
  private mounted() {
    this.delete_event = this.delete_handler.bind(this);
    window.addEventListener('keyup', this.delete_event);
  }

  private destroyed() {
    window.removeEventListener('keyup', this.delete_event);
    if (!this.drawboard) { return; }
    this.drawboard.destroyed();
  }
  /** 事件 */
  private delete_event = (_: any) => {};

  /* ------------------------ WATCH ------------------------ */
  @Watch('color') private color_changed(val: string) {
    if (!this.show) { return; }
    if (!this.drawboard) { return; }

    this.drawboard.set_brush({color: val});
  }

  @Watch('show') private show_changed(val: boolean) {
    if (!val) {
      this.rotate_angle = DEFAULT_ANGLE;
      this.in_move_mode = false;
    }
  }

  /* ------------------------ METHODS ------------------------ */
  private init_drawboard() {
    if (this.drawboard) { return; }
    const $canvas = this.$refs.canvas;
    if (!$canvas) {
      console.error('[draw-dialog] canvas not found!');
      return;
    }

    this.drawboard = new Drawboard({
      canvas: $canvas as HTMLCanvasElement,
      brush_color: this.color,
      brush_width: 2,
      mode: DrawMode.PEN,
      back_event: (history: string[]) => {
        if (!history.length) {
          this.$message.warning('没有可撤销的记录了');
          this.draw_init_state();
        }
      },
    });
    this.current_button_index = DEFAULT_MODE;
    this.register_custom_draw_func();

    (window as any).drawboard = this.drawboard;
  }

  private destroy_drawboard() {
    if (this.drawboard) {
      this.drawboard.destroyed();
    }
    this.drawboard = null;
  }

  private async reset_canvas(w = DEFAULT_CANVAS_WG.width, h = DEFAULT_CANVAS_WG.height) {
    this.canvas_wh = { width: w, height: h };
    await this.$nextTick();
    this.destroy_drawboard();
    this.init_drawboard();
  }

  private button_clicked(button_index: number) {
    if (!this.drawboard) { return; }

    // 退出移动模式
    if (this.in_move_mode && ([6, 7].indexOf(button_index) === -1)) {
      this.in_move_mode = false;
    }

    switch (button_index) {
    case 0: // 画矩形
      this.drawboard.set_mode(DrawMode.RECT);
      this.current_button_index = button_index;
      break;
    case 1: // 画圆
      this.drawboard.set_mode(DrawMode.CIRCLE);
      this.current_button_index = button_index;
      break;
    case 2: // 画箭头
      this.drawboard.set_custom_draw_func_enable([this.btn_names[button_index]]);
      this.current_button_index = button_index;
      break;
    case 3: // 画直线
      this.drawboard.set_mode(DrawMode.LINE);
      this.current_button_index = button_index;
      break;
    case 4: // 画笔
      this.drawboard.set_mode(DrawMode.PEN);
      this.current_button_index = button_index;
      break;
    case 5: // 输入文字
      this.drawboard.set_mode(DrawMode.TEXT);
      this.current_button_index = button_index;
      break;
    case 6: // 撤销
      this.drawboard.back();
      break;
    case 7: // 清屏
      this.drawboard.clear();
      this.draw_init_state();
      break;
    case 8: // 勾
      this.drawboard.set_custom_draw_func_enable([this.btn_names[button_index]]);
      this.current_button_index = button_index;
      break;
    case 9: // 叉
      this.drawboard.set_custom_draw_func_enable([this.btn_names[button_index]]);
      this.current_button_index = button_index;
      break;
    case 10: // A+
      this.drawboard.set_custom_draw_func_enable([this.btn_names[button_index]]);
      this.current_button_index = button_index;
      break;
    case 11: // A-
      this.drawboard.set_custom_draw_func_enable([this.btn_names[button_index]]);
      this.current_button_index = button_index;
      break;
    case 12: // 旋转
      this.rotate();
      break;
    }
  }

  private close() {
    this.close_handler();
  }

  private submit() {
    if (!this.drawboard) { return; }
    const base64 = this.drawboard.to_img();
    const blob = this.base64_to_blob(base64);
    this.submit_handler({ base64, blob });
  }

  /** 移动模式 */
  private change_move_mode() {
    if (!this.drawboard) { return; }
    this.in_move_mode = !this.in_move_mode;
    if (this.in_move_mode) {
      this.drawboard.enable_select();
    } else {
      this.button_clicked(this.current_button_index);
    }
  }

  /** 键盘事件-删除 */
  private delete_handler(ev: any) {
    ev.preventDefault();
    ev.stopPropagation();
    if (!this.show) { return; }
    // DEL 删除按钮
    if (ev.keyCode !== 46) { return; }
    this.delete_selected();
  }

  /** 删除 */
  private delete_selected() {
    if (!this.drawboard) { return; }
    this.drawboard.delete_selected();
  }

  /** 绘制初始状态 */
  private draw_init_state() {
    if (this.init_state.is_img) {
      this.set_img(this.init_state.data, this.rotate_angle);
    } else {
      this.set_text(this.init_state.data, this.rotate_angle);
    }
  }

  /** 旋转 */
  private async rotate() {
    if (!this.drawboard) { return; }
    const status = await confirm_message('旋转会重置绘图状态，是否确定');
    if (!status) { return; }

    this.drawboard.clear();
    let r = this.rotate_angle;
    r += 90;
    if (r > 360) { r = 0; }
    this.rotate_angle = r;
    this.draw_init_state();
  }

  /** 注册自定义绘图函数 */
  private register_custom_draw_func() {
    if (!this.drawboard) { return; }

    // 箭头
    register_arror_draw(this.btn_names[2], this.drawboard);
    // 勾
    register_right_draw(this.btn_names[8], this.drawboard);
    // 叉
    register_wrong_draw(this.btn_names[9], this.drawboard);
    // A+
    register_aplus_draw(this.btn_names[10], this.drawboard);
    // A-
    register_aminus_draw(this.btn_names[11], this.drawboard);

  }

  /** 将以 base64 数据转换为 Blob  */
  private base64_to_blob(base64: string): Blob | null {
    try {
      const bytes = window.atob(base64.split(',')[1]);

      // 处理异常,将 ascii 码小于 0 的转换为大于0
      const ab = new ArrayBuffer(bytes.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < bytes.length; i++) {
          ia[i] = bytes.charCodeAt(i);
      }

      return new Blob([ab] , {type : 'image/png'});
    } catch (err) {
      return null;
    }
  }

}
</script>

<template>
<base-dialog class="module_draw_dialog" :show="show" title="批注" size="big_normal" top="5%"
  footer-size="small" isAppendToBody :click-modal-can-close-dialog="false"
  @close="close" @submit="submit">

  <div class="draw_wrapper" ref="draw_wrapper" :style="{height: DEFAULT_CANVAS_WG.height + 'px'}" v-loading="img_loading" element-loading-text="图片加载中">
    <canvas ref="canvas" :width="canvas_wh.width" :height="canvas_wh.height">你的浏览器不支持 canvas，请升级你的浏览器</canvas>
  </div>

  <el-color-picker title="选择颜色" class="color_picker" v-model="color" size="mini" />
  <el-button title="选择" class="move_btn" icon="el-icon-rank" circle size="mini"
    :type="in_move_mode ? 'success' : 'info'"
    @click.stop="change_move_mode" />
  <el-button title="删除所选" class="delete_btn" icon="el-icon-delete" circle size="mini" type="danger" @click.stop="delete_selected" />

  <ul class="draw_control">
    <li :class="['draw_control_item', {active: index === current_button_index && !in_move_mode}]" v-for="(img_name, index) in 13"
      :style="{width: 100 / 13 + '%'}" :key="index"
      @click.stop="button_clicked(index)">
      <img :src="require('./btns/' + img_name + '.png')" alt="">
      {{ btn_names[index] }}
    </li>
  </ul>

</base-dialog>
</template>

<style lang="stylus">
// 清浮动
clearfix()
  &:after
    display block
    content "."
    height 0
    line-height 0
    clear both
    visibility hidden

.module_draw_dialog
  .draw_wrapper
    width 100%
    overflow auto
  .dialog_body
    position relative
    .color_picker
      position absolute
      top 2px
      right 15px
      .el-color-picker__trigger
        border none
    .move_btn
      position absolute
      bottom 150px
      right 20px
    .delete_btn
      position absolute
      bottom 110px
      right 20px
  .draw_control
    height 90px
    width 100%
    background-color #26bf80
    user-select none
    clearfix()
  .draw_control_item
    height 100%
    float left
    text-align center
    color #fff
    font-weight bolder
    cursor pointer
    background-color transparent
    &:hover, &.active
      background-color #21a971

</style>

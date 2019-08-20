<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';

@Component({
  name: 'base-dialog',
})
export default class BaseDialog extends Vue {
  /* ------------------------ INPUT & OUTPUT ------------------------ */
  /** 异步 submit (submit 期间会禁用 submit 按钮) */
  @Prop({type: Boolean, default: false}) private isAsyncSubmit!: boolean;
  /** loading (该状态中不能关闭弹窗) */
  @Prop({type: Boolean, default: false}) private loading!: boolean;

  // 显示关闭弹窗的控制项
  @Prop({type: Boolean, default: false}) private show!: boolean;
  // 弹窗是否要 append 到 body 元素上
  @Prop({type: Boolean, default: false}) private isAppendToBody!: boolean;
  // 是否全屏
  @Prop({type: Boolean, default: false}) private isFullscreen!: boolean;

  // 弹窗的 modal
  @Prop({type: Boolean, default: true}) private hasModal!: boolean;
  // 是否可以通过点击 modal 关闭 Dialog
  @Prop({type: Boolean, default: false}) private clickModalCanCloseDialog!: boolean;
  // 是否可通过 esc 关闭 Dialog
  @Prop({type: Boolean, default: true}) private closeOnPressEscape!: boolean;

  // 弹窗的 top
  @Prop({type: String, default: '12%'}) private top!: string;
  // 弹窗的 right
  @Prop({type: String, default: 'auto'}) private right!: string;

  // 是否有默认 header
  @Prop({type: Boolean, default: true}) private hasHeader!: boolean;
  // hasHeader 为 true 的情况下，显示的 title
  @Prop({type: String, default: '提示'}) private title!: string;
  // header 下方是否有分隔线 (默认是占满全 dialog 的 border-bottom)
  @Prop({type: Boolean, default: false}) private hasCutOffLine!: boolean;
  // 不显示弹窗的 x 按钮
  @Prop({type: Boolean, default: true}) private hasCloseXButton!: boolean;

  // 是否有默认 footer (按钮组)
  @Prop({type: Boolean, default: true}) private hasFooter!: boolean;
  // footer 的尺寸 small: 60 / middle&big: 90
  @Prop({type: String, default: 'middle'}) private footerSize!: string;
  // 取消按钮文字
  @Prop({type: String, default: '取 消'}) private cancelButtonText!: string;
  // 确定按钮文字
  @Prop({type: String, default: '确 定'}) private okButtonText!: string;

  // 弹窗尺寸 small: 300 / middle: 600 / normal: 800 / big_normal: 1000 / big: 1200
  @Prop({type: String, default: 'middle'}) private size!: string;
  // 由内容撑开弹窗宽度
  @Prop({type: Boolean, default: false}) private autoWidth!: boolean;
  // 弹窗 body 的最小高度
  @Prop({type: Number, default: 200}) private minHeight!: number;

  // 弹窗打开事件
  @Emit('open') private openHandler() {}
  // 弹窗关闭事件
  @Emit('close') private closeHandler() {}
  // 弹窗关闭事件 (取消按钮)
  @Emit('cancel') private cancelHandler() {}
  // 弹窗 footer 确定按钮点击事件
  @Emit('submit') private submitHandler(next?: () => void) {}

  /* ------------------------ VUEX (vuex getter & vuex action) ------------------------ */

  /* ------------------------ LIFECYCLE HOOKS (created & mounted & ...) ------------------------ */
  private mounted(): void {
  }

  /* ------------------------ COMPONENT STATE (data & computed & model) ------------------------ */
  private disabled_submit_button = false;
  private get dialog_classname() {
    return this.autoWidth
      ? `${this.loading ? 'dialog_loading' : ''}`
      : `module_base_dialog module_base_dialog_${this.size} ${
        this.hasCloseXButton ? '' : 'hide_close_button'} ${
        this.loading ? 'dialog_loading' : ''}`;
  }

  /* ------------------------ WATCH ------------------------ */
  @Watch('show') private show_changed(val: boolean): void {
    if (val) {
      this.set_dialog_right_style();
    }
  }

  /* ------------------------ METHODS ------------------------ */
  /**
   * 设置弹窗的 right style
   */
  private set_dialog_right_style(): void {
    const $dialog = this.$el.querySelector('.module_base_dialog');

    if ($dialog) {
      ($dialog as HTMLElement).style.marginRight = this.right;
    }
  }

  /**
   * 关闭弹窗
   */
  private close(): void {
    if (this.loading) { return; }
    this.closeHandler();
  }

  /**
   * 关闭弹窗 (取消按钮)
   */
  private cancel(): void {
    if (this.loading) { return; }
    this.cancelHandler();
    this.closeHandler();
  }

  /**
   * 打开弹窗
   */
  private open(): void {
    this.openHandler();
  }

  /**
   * 点击了 footer 按钮组的确定按钮
   */
  private submit(is_async = false): void {
    if (this.loading) { return; }
    if ( ! is_async) {
      this.submitHandler();
    } else {
      this.disabled_submit_button = true;
      this.submitHandler(() => {
        this.disabled_submit_button = false;
      });
    }
  }

}

</script>

<template>
<el-dialog ref="dialog" :visible.sync="show" :fullscreen="isFullscreen"
  :custom-class="dialog_classname" :close-on-press-escape="closeOnPressEscape"
  :lock-scroll="true" :top="top" :append-to-body="isAppendToBody" :modal="hasModal"
  :close-on-click-modal="clickModalCanCloseDialog"
  :before-close="close" @open="open">

  <template v-if="hasHeader">
    <div slot="title" :class="['dialog_header', {['cut_off_line_' + size]: hasCutOffLine}, {dialog_loading: loading}]">
      <slot name="header">
        <h4 slot="title" class="header_title">{{ title }}</h4>
      </slot>
    </div>
  </template>

  <div class="dialog_body" :style="{minHeight: minHeight + 'px'}"  v-loading="loading">
    <slot></slot>
  </div>

  <template v-if="hasFooter">
    <div slot="footer">
      <slot name="footer">
        <div slot="footer" :class="['dialog_footer', 'dialog_footer_' + footerSize, {['cut_off_line_' + size]: hasCutOffLine}]">
          <el-button class="footer_button grey_button" :disabled="loading" @click.stop="cancel">{{cancelButtonText}}</el-button>

          <el-button v-if="isAsyncSubmit" :disabled="disabled_submit_button || loading" class="footer_button" type="primary"
            @click.stop="submit(true)">{{okButtonText}}</el-button>
          <el-button v-else class="footer_button" type="primary" :disabled="loading" @click.stop="submit">{{okButtonText}}</el-button>
        </div>
      </slot>
    </div>
  </template>

</el-dialog>
</template>

<style lang="stylus">
$border_color = #e8e8e8

$_header_height        = 60px

$_footer_middle_height = 90px
$_footer_small_height  = 90px

$_dialog_small_width      = 300px
$_dialog_middle_width     = 600px
$_dialog_normal_width     = 800px
$_dialog_big_normal_width = 1000px
$_dialog_big_width        = 1200px

$_padding_left_and_right = 25px


// dialog footer style
_footer_style($height, $btn_h, $btn_w)
  height $height
  line-height 80px
  // border-top 1px solid $border_color
  text-align center
  .footer_button
      height $btn_h
      width  $btn_w
      line-height 0
      &.grey_button
        background-color #f5f5f5
    .footer_button + .footer_button
      margin-left 30px
    // span
    //   letter-spacing 6px
  &.cut_off_line_small
    _footer_cut_off_line_style($_dialog_small_width)
  &.cut_off_line_middle
    _footer_cut_off_line_style($_dialog_middle_width)
  &.cut_off_line_normal
    _footer_cut_off_line_style($_dialog_normal_width)
  &.cut_off_line_big_normal
    _footer_cut_off_line_style($_dialog_big_normal_width)
  &.cut_off_line_big
    _footer_cut_off_line_style($_dialog_big_width)

// 分隔线 style
_header_cut_off_line_style($size)
  position relative
  border-bottom none
  &::after
    content ' '
    display block
    position absolute
    left $_padding_left_and_right
    bottom 0
    height 1px
    width $size - ($_padding_left_and_right * 2)
    background-color $border_color
_footer_cut_off_line_style($size)
  position relative
  border-top none
  &::after
    content ' '
    display block
    position absolute
    left $_padding_left_and_right
    top 0
    height 1px
    width $size - ($_padding_left_and_right * 2)
    background-color $border_color


.module_base_dialog
  // header
  .el-dialog__header
    padding 0
    .el-dialog__close
      font-size 26px
      line-height 10px
      color #8C8C8C
      font-weight 700
  &.hide_close_button
    .el-dialog__headerbtn
      display none
  &.dialog_loading
    .el-dialog__headerbtn
      .el-icon-close:before
        color $border_color
        cursor not-allowed
  .dialog_header
    height $_header_height
    line-height $_header_height
    border-bottom 1px solid $border_color
    padding-left $_padding_left_and_right
    letter-spacing 1px
    &.cut_off_line_small
      _header_cut_off_line_style($_dialog_small_width)
    &.cut_off_line_middle
      _header_cut_off_line_style($_dialog_middle_width)
    &.cut_off_line_normal
      _header_cut_off_line_style($_dialog_normal_width)
    &.cut_off_line_big_normal
      _header_cut_off_line_style($_dialog_big_normal_width)
    &.cut_off_line_big
      _header_cut_off_line_style($_dialog_big_width)
  .header_title
    font-size 18px
    font-weight bolder
    color #595959
  .dialog_header~.el-dialog__headerbtn
    top $_padding_left_and_right
    right $_padding_left_and_right
  // footer
  .el-dialog__footer
    padding 0
  .dialog_footer_middle, .dialog_footer_big
    _footer_style($_footer_middle_height, 30px, 106px)
    // _footer_style($_footer_middle_height, 36px, 96px)
  .dialog_footer_small
    _footer_style($_footer_middle_height, 30px, 106px)
    // _footer_style($_footer_small_height, 28px, 74px)
  // body
  .el-dialog__body
    padding 0
    width 100%


// width dialog
.module_base_dialog_small
  width $_dialog_small_width
.module_base_dialog_middle
  width $_dialog_middle_width
.module_base_dialog_normal
  width $_dialog_normal_width
.module_base_dialog_big_normal
  width $_dialog_big_normal_width
.module_base_dialog_big
  width $_dialog_big_width

</style>

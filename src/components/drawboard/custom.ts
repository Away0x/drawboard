import Drawboard from './drawboard';

// 绘制箭头
export function register_arror_draw(name: string, drawboard: Drawboard) {
  drawboard.register_custom_draw_func({
    name,
    get_draw_path_options(from, to) {
      const theta = 30;
      const headlen = 10;
      const angle = Math.atan2(from.y - to.y, from.x - to.x) * 180 / Math.PI;
      const angle1 = (angle + theta) * Math.PI / 180;
      const angle2 = (angle - theta) * Math.PI / 180;
      const topX = headlen * Math.cos(angle1);
      const topY = headlen * Math.sin(angle1);
      const botX = headlen * Math.cos(angle2);
      const botY = headlen * Math.sin(angle2);

      let arrowX = from.x - topX;
      let arrowY = from.y - topY;

      let path = ' M ' + from.x + ' ' + from.y;
      path += ' L ' + to.x + ' ' + to.y;
      arrowX = to.x + topX;
      arrowY = to.y + topY;
      path += ' M ' + arrowX + ' ' + arrowY;
      path += ' L ' + to.x + ' ' + to.y;
      arrowX = to.x + botX;
      arrowY = to.y + botY;
      path += ' L ' + arrowX + ' ' + arrowY;

      return {
        path,
      };
    },
  });
}

// 绘制勾
export function register_right_draw(name: string, drawboard: Drawboard) {
  drawboard.register_custom_draw_func({
    name,
    event: 'up',
    get_draw_path_options(from, _) {
      const modify = 20;
      const path =
        'M ' +
        (from.x - modify) +
        ' ' +
        (from.y - modify) +
        ' L ' +
        from.x +
        ' ' +
        from.y +
        ' L ' +
        (from.x + modify * 2) +
        ' ' +
        (from.y - modify * 2);

      return {
        path,
      };
    },
  });
}

// 绘制叉
export function register_wrong_draw(name: string, drawboard: Drawboard) {
  drawboard.register_custom_draw_func({
    name,
    event: 'up',
    get_draw_path_options(from, _) {
      const modify = 20;
      const path =
        'M ' +
        (from.x - modify) +
        ' ' +
        (from.y - modify) +
        ' L ' +
        (from.x + modify) +
        ' ' +
        (from.y + modify) +
        'M ' +
        (from.x + modify) +
        ' ' +
        (from.y - modify) +
        ' L ' +
        (from.x - modify) +
        ' ' +
        (from.y + modify);

      return {
        path,
      };
    },
  });
}

// 绘制 A+
export function register_aplus_draw(name: string, drawboard: Drawboard) {
  drawboard.register_custom_draw_func({
    name,
    type: 'text',
    event: 'up',
    get_draw_text_options() {
      return {
        text: ['A+'],
        width: 40,
        font_size: 40,
      };
    },
  });
}

// 绘制 A-
export function register_aminus_draw(name: string, drawboard: Drawboard) {
  drawboard.register_custom_draw_func({
    name,
    type: 'text',
    event: 'up',
    get_draw_text_options() {
      return {
        text: ['A-'],
        width: 40,
        font_size: 40,
      };
    },
  });
}

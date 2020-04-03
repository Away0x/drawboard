import Drawboard from './drawboard';

const base_width = 2;

// 绘制箭头
export function register_arror_draw(name: string, drawboard: Drawboard) {
  drawboard.register_custom_draw_func({
    name,
    get_draw_path_options(from, to, width) {
      let zoom = 1;

      if (width > base_width) {
        zoom = width / base_width;
      }

      const theta = 30 * 1;
      const headlen = 10 * 1;
      const angle = (Math.atan2(from.y - to.y, from.x - to.x) * 180 / Math.PI) * 1;
      const angle1 = ((angle + theta) * Math.PI / 180) * 1;
      const angle2 = ((angle - theta) * Math.PI / 180) * 1;
      const topX = (headlen * Math.cos(angle1)) * zoom;
      const topY = (headlen * Math.sin(angle1)) * zoom;
      const botX = (headlen * Math.cos(angle2)) * zoom;
      const botY = (headlen * Math.sin(angle2)) * zoom;

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
    get_draw_path_options(from, _, width) {
      let modify = 20;

      if (width > base_width) {
        modify = (width / base_width) * modify;
      }

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
    get_draw_path_options(from, _, width) {
      let modify = 20;

      if (width > base_width) {
        modify = (width / base_width) * modify;
      }

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
    get_draw_text_options(size) {
      let fsize = 40;

      if (size > 40) {
        fsize = (size / 40) * fsize * 2;
      }

      return {
        text: ['A+'],
        width: fsize,
        font_size: fsize,
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
    get_draw_text_options(size) {
      let fsize = 40;

      if (size > 40) {
        fsize = (size / 40) * fsize * 2;
      }

      return {
        text: ['A-'],
        width: fsize,
        font_size: fsize,
      };
    },
  });
}

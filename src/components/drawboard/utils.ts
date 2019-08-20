import { MessageBox } from 'element-ui';
import { MessageType } from 'element-ui/types/message';
import { VNode } from 'vue';

const _isType = (type: string) => (target: any): boolean =>
  Object.prototype.toString.call(target) === '[object ' + type + ']';

export const is_array = _isType('Array');
export const is_number = _isType('Number');
export const is_string = _isType('String');
export const is_object = _isType('Object');

export function get_img_src_or_url(str: string = ''): string {
  const reg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
  const match = reg.exec(str);

  if (str.startsWith('http')) {
    return str;
  } else if (match && match[1]) {
    return match[1];
  }

  return '';
}

export function get_image_natural_wh(url: string): Promise<{ width: number, height: number }> {
  return new Promise((resolve) => {
    const img = new Image();

    img.src = url;
    img.onload = () => {
      return resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      return resolve({ width: 0, height: 0 });
    };
  });
}

export async function confirm_message(message: string | VNode, title: string = '提示', type: MessageType = 'warning', options: object = {}): Promise<boolean> {
  try {
    await MessageBox.confirm(message as string, title,
      Object.assign({}, { confirmButtonText: '确定', cancelButtonText: '取消', type }, options));

    return true;
  } catch (err) {
    return false;
  }
}

export function network_url_replace_to_root_url(raw_url: string, has_line = true): string {
  const replacer = has_line ? '/' : '';
  return raw_url
    .replace('https://', 'http://')
    .replace(/http:\/\/(.*?)\//i, replacer);
}

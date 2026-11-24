/**
 * A new value for every server response. The toast and the "request on its way" bar use it as their key,
 * so each response starts the toast from the beginning and ends the bar.
 */
export function createRenderKey() {
  return Date.now();
}

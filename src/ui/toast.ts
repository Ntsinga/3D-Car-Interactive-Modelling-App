const el = () => document.getElementById('toast')!;
let timer: ReturnType<typeof setTimeout>;

export function toast(message: string) {
  const t = el();
  t.textContent = message;
  t.classList.add('on');
  clearTimeout(timer);
  timer = setTimeout(() => t.classList.remove('on'), 1900);
}

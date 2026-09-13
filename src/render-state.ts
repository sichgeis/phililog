// Preserve the user's place across the small app's synchronous DOM replacement.
export function preserveFormState(root: HTMLElement): () => void {
  const active = document.activeElement;
  let selector = active instanceof HTMLElement && root.contains(active)
    ? active.id ? `#${CSS.escape(active.id)}` : [...active.attributes]
      .filter(a => a.name.startsWith('data-'))
      .map(a => `[${a.name}="${CSS.escape(a.value)}"]`).join('')
    : '';
  if (!selector && active instanceof HTMLElement && root.contains(active)) {
    const path: string[] = [];
    for (let node: Element | null = active; node && node !== root; node = node.parentElement) {
      const siblings = [...node.parentElement!.children].filter(el => el.tagName === node!.tagName);
      path.unshift(`${node.tagName.toLowerCase()}:nth-of-type(${siblings.indexOf(node) + 1})`);
    }
    selector = path.join(' > ');
  }
  const selection = active instanceof HTMLInputElement && active.selectionStart !== null
    ? [active.selectionStart, active.selectionEnd, active.selectionDirection ?? undefined] as const : null;
  const details = [...root.querySelectorAll<HTMLDetailsElement>('form details[id]')].map(el => ({ id: el.id, open: el.open }));
  return () => {
    for (const state of details) {
      const next = root.querySelector<HTMLDetailsElement>(`#${CSS.escape(state.id)}`);
      if (next) next.open = state.open;
    }
    const next = selector ? root.querySelector<HTMLElement>(selector) : null;
    next?.focus({ preventScroll: true });
    if (selection && next instanceof HTMLInputElement) next.setSelectionRange(...selection);
  };
}

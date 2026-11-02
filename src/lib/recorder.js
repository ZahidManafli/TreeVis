// Ümumi addım yazıcısı (Array, Linked List, Stack, Queue, Hash Table üçün).
// Hər addım: datanın snapshot-u + vurğulamalar (hl), göstəricilər (ptr), dəyişənlər, psevdokod sətri.

let uid = 0;
export const newId = (prefix = 'x') => `${prefix}${++uid}`;

export class Recorder {
  constructor(data) {
    this.data = structuredClone(data);
    this.steps = [];
    this.hl = {};
    this.ptr = {};
    this.vars = {};
  }

  step(line, msg, extra = {}) {
    const { kind = 'info', ...ui } = extra;
    this.steps.push({
      data: structuredClone(this.data),
      line,
      msg,
      kind,
      hl: { ...this.hl },
      ptr: { ...this.ptr },
      vars: { ...this.vars },
      ...ui,
    });
  }

  result(algo) {
    return { algo, steps: this.steps, data: structuredClone(this.data) };
  }
}

export const list = (arr) => `[${arr.join(', ')}]`;

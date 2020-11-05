import { File } from '@/interfaces/Data'
export function flattenFiles(files: File[]) {
  return files.reduce<GLobalObject<File>>((pre, next) => {
    pre[next.id] = next
    return pre
  }, {})
}

export function obj2Arr<T = any>(obj: GLobalObject<T>): T[] {
  return Object.keys(obj).map((key) => obj[key])
}

export function getParentNode(
  node: HTMLElement | null,
  parentClassName: string
) {
  let current = node
  while (current !== null) {
    if (current.classList && current.classList.contains(parentClassName)) {
      return current
    }
    current = current.parentElement
  }
  return false
}

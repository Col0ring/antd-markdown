import { File } from '@/interfaces/Data'
import { settingsStore } from '@/utils/store'
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
): HTMLElement | null {
  let current = node
  while (current !== null) {
    if (current.classList && current.classList.contains(parentClassName)) {
      return current
    }
    current = current.parentElement
  }
  return null
}

export function getAutoSync() {
  return ['accessKey', 'secretKey', 'bucketName', 'enableAutoSync'].every(
    (key) => !!settingsStore.get(key)
  )
}

export function formatTime(timestamp: number) {
  const date = new Date(timestamp)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

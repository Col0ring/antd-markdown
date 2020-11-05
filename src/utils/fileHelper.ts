import fsModule from 'fs'
const fs = (window.require('fs') as typeof fsModule).promises

const errorCapture = async (
  cb: (...args: any[]) => Promise<any>,
  ...args: any[]
): Promise<boolean> => {
  try {
    return (await (cb && cb(...args))) || true
  } catch (error) {
    console.log(error)
    return false
  }
}

const fileHelper = {
  readFile(path: string) {
    return errorCapture(fs.readFile, path, { encoding: 'utf-8' })
  },
  writeFile(path: string, content: string) {
    return errorCapture(fs.writeFile, path, content, { encoding: 'utf-8' })
  },
  renameFile(path: string, newPath: string) {
    return errorCapture(fs.rename, path, newPath)
  },
  deleteFile(path: string) {
    return errorCapture(fs.unlink, path)
  },
}

export default fileHelper

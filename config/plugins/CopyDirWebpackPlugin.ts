import fs from 'fs'
import path from 'path'
import { Compiler } from 'webpack'

/**
 * webpack 脚本
 * @description webpack 打包完成并且生成资源到 output 目录之后，会将生成的资源复制到指定目录中
 */
interface Options {
  dirFiles?: string
  dir?: string
  dirTo?: string
  dirFilesTo?: string
}

class CopyFileWebpackPlugin {
  /**
   *
   * @param { string } options.dirFiles 目录，复制该目录下所有文件(非文件夹)
   * @param { string } options.dir 目录，复制该目录下所有文件夹下的所有文件
   * @param { string } options.dirTo 复制到该目录
   * @param { string } options.dirFilesTo 复制到该目录
   */
  constructor(private readonly options: Options = {}) {}
  // webpack 规定每个插件的实例，必须有一个 .apply() 方法，webpack 打包前会调用所有插件的方法，插件可以在该方法中进行钩子的注册。
  apply(compiler: Compiler) {
    compiler.hooks.afterEmit.tapAsync(
      'CopyWebpackPlugin',
      (compilation, cb: () => void) => {
        try {
          if (!fs.copyFile) {
            console.error('Your nodejs version is too low, please upgrade!')
          } else {
            if (this.options.dirFilesTo) {
              if (!fs.existsSync(this.options.dirFilesTo)) {
                fs.mkdirSync(this.options.dirFilesTo, { recursive: true })
              } else {
                delDir(this.options.dirFilesTo)
              }
            }

            if (this.options.dirTo) {
              if (!fs.existsSync(this.options.dirTo)) {
                fs.mkdirSync(this.options.dirTo, { recursive: true })
              } else {
                delDir(this.options.dirTo)
              }
            }

            if (this.options.dirFiles && this.options.dirFilesTo) {
              const files = fs.readdirSync(this.options.dirFiles, {
                withFileTypes: true,
              })
              files.forEach((file) => {
                if (file.isFile()) {
                  fs.copyFile(
                    path.resolve(this.options.dirFiles!, file.name),
                    path.resolve(this.options.dirFilesTo!, file.name),
                    (error) => {
                      if (error) {
                        console.error(file.name + '复制失败：' + error)
                      } else {
                        console.log(file.name + '复制成功！')
                      }
                    }
                  )
                }
              })
            }

            if (this.options.dir && this.options.dirTo) {
              const files = fs.readdirSync(this.options.dir, {
                withFileTypes: true,
              })
              files.forEach((file) => {
                if (file.isDirectory()) {
                  copyDir(
                    path.resolve(this.options.dir!, file.name),
                    path.resolve(this.options.dirTo!, file.name),
                    (error) => {
                      console.error(file.name + '复制失败!' + error)
                    }
                  )
                }
              })
            }
          }
        } catch (error) {
          console.error(error)
        } finally {
          cb && cb()
        }
      }
    )
  }
}

/*
 * 复制目录、子目录，及其中的文件
 * @param src {String} 要复制的目录
 * @param to {String} 复制到目标目录
 */
function copyDir(
  src: string,
  to: string,
  callback: (err: NodeJS.ErrnoException | null) => void
) {
  fs.access(to, function (err) {
    if (err) {
      // 目录不存在时创建目录
      fs.mkdirSync(to)
    }
    copy(null, src, to, callback)
  })
}

function copy(
  err: null | NodeJS.ErrnoException,
  src: string,
  to: string,
  callback: (err: NodeJS.ErrnoException | null) => void
) {
  if (err) {
    callback(err)
  } else {
    fs.readdir(src, function (err, paths) {
      if (err) {
        callback(err)
      } else {
        paths.forEach(function (path) {
          const fileSrc = src + '/' + path
          const fileTo = to + '/' + path
          fs.stat(fileSrc, function (err, stat) {
            if (err) {
              callback(err)
            } else {
              // 判断是文件还是目录
              if (stat.isFile()) {
                console.log(path + '复制成功!')
                fs.writeFileSync(fileTo, fs.readFileSync(fileSrc))
              } else if (stat.isDirectory()) {
                // 当是目录是，递归复制
                copyDir(fileSrc, fileTo, callback)
              }
            }
          })
        })
      }
    })
  }
}

function delDir(path: string) {
  let files = []
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path)
    files.forEach((file) => {
      const curPath = path + '/' + file
      if (fs.statSync(curPath).isDirectory()) {
        delDir(curPath) //递归删除文件夹
      } else {
        fs.unlinkSync(curPath) //删除文件
      }
    })
  }
}

export default CopyFileWebpackPlugin

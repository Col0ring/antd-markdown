import qiniu from 'qiniu'
import axios from 'axios'
import fs from 'fs'

class QiniuManager {
  mac: qiniu.auth.digest.Mac
  config: qiniu.conf.Config
  bucketManager: qiniu.rs.BucketManager
  publicBucketDomain?: string
  constructor(
    accessKey: string,
    secretKey: string,
    private readonly bucket: string
  ) {
    //generate mac
    this.mac = new qiniu.auth.digest.Mac(accessKey, secretKey)

    // init config class
    this.config = new qiniu.conf.Config({
      zone: qiniu.zone.Zone_z2,
    })
    // 空间对应的机房
    this.bucketManager = new qiniu.rs.BucketManager(this.mac, this.config)
  }

  uploadFile(key: string, localFilePath: string) {
    if (!fs.existsSync(localFilePath)) {
      return Promise.reject('no file')
    }
    // generate uploadToken
    const options = {
      // 如果有同名的强制覆盖
      scope: this.bucket + ':' + key,
    }
    const putPolicy = new qiniu.rs.PutPolicy(options)
    const uploadToken = putPolicy.uploadToken(this.mac)
    const formUploader = new qiniu.form_up.FormUploader(this.config)
    const putExtra = new qiniu.form_up.PutExtra()
    //文件上传
    return new Promise((resolve, reject) => {
      formUploader.putFile(
        uploadToken,
        key,
        localFilePath,
        putExtra,
        this._handleCallback(resolve, reject)
      )
    })
  }
  renameFile(key: string, newName: string) {
    return new Promise((resolve, reject) => {
      this.bucketManager.move(
        this.bucket,
        key,
        this.bucket,
        newName,
        {
          force: false,
        },
        this._handleCallback(resolve, reject)
      )
    })
  }
  deleteFile(key: string) {
    return new Promise((resolve, reject) => {
      this.bucketManager.delete(
        this.bucket,
        key,
        this._handleCallback(resolve, reject)
      )
    })
  }
  // 获取测试的 BucketDomain(
  getBucketDomain() {
    const reqURL = `http://api.qiniu.com/v6/domain/list?tbl=${this.bucket}`
    const digest = qiniu.util.generateAccessToken(this.mac, reqURL)

    return new Promise((resolve, reject) => {
      qiniu.rpc.postWithoutForm(
        reqURL,
        digest,
        this._handleCallback(resolve, reject)
      )
    })
  }
  getStat(key: string) {
    return new Promise<any>((resolve, reject) => {
      this.bucketManager.stat(
        this.bucket,
        key,
        this._handleCallback(resolve, reject)
      )
    })
  }
  generateDownloadLink(key: string) {
    const domainPromise = this.publicBucketDomain
      ? Promise.resolve([this.publicBucketDomain])
      : this.getBucketDomain()

    return domainPromise.then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        const pattern = /^https?/
        this.publicBucketDomain = pattern.test(data[0])
          ? data[0]
          : `http://${data[0]}`
        return this.bucketManager.publicDownloadUrl(
          this.publicBucketDomain!,
          key
        )
      } else {
        throw Error('域名未找到，请查看存储空间是否已经过期')
      }
    })
  }
  downloadFile(key: string, downloadPath: string) {
    // step 1 get the download link
    // step 2 send the request to download link, return a readable stream
    // step 3 create a writable stream and pipe to it
    // step 4 return a promise based result
    return this.generateDownloadLink(key)
      .then((link) => {
        const timeStamp = new Date().getTime()
        const url = `${link}?timestamp=${timeStamp}`
        return axios({
          url,
          method: 'GET',
          responseType: 'stream',
          headers: { 'Cache-Control': 'no-cache' },
        })
      })
      .then((response) => {
        const writer = fs.createWriteStream(downloadPath)
        // 可读流调用 pipe 方法写入到可写流当中，下载的时候直接将原文件覆盖
        response.data.pipe(writer)
        return new Promise((resolve, reject) => {
          writer.on('finish', resolve)
          writer.on('error', reject)
        })
      })
      .catch((err) => {
        return Promise.reject({ err: err.response })
      })
  }
  private _handleCallback(
    resolve: (value: any) => void,
    reject: (reason: any) => void
  ) {
    return ((respErr, respBody, respInfo) => {
      if (respErr) {
        throw respErr
      }
      if (respInfo.statusCode === 200) {
        resolve(respBody)
      } else {
        reject({
          statusCode: respInfo.statusCode,
          body: respBody,
        })
      }
    }) as qiniu.callback
  }
}

export default QiniuManager

class Docker {

    constructor(initObj) {
        this.host = initObj.host
        this.port = initObj.port
    }

    run(imageName, runArgArray, runOutputStream, runParamObj) {
        this.imageName = imageName
        this.runArgArray = runArgArray
        this.runOutputStream = runOutputStream
        this.runParamObj = runParamObj
    }

    getContainer(containerName) {
        this.container = new Container(containerName)
        return this.container
    }

}

class Container {
    constructor(containerName) {
        this.containerName = containerName
    }

    stop() {
        return new Propise((resolve, reject) => {
            resolve(this)
        })
    }

    remove() {
        this.removed = true
    }
}

module.exports = Docker
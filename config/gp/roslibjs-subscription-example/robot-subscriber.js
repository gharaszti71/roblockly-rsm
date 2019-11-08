const ROSLIB = require('roslib')

class RobotSubscriber {
  constructor (options) {
    this.name = options.name || 'mxw-robot'
    this.rosIP = options.rosIP
    this.baseLink = options.baseLink || 'base_link'
    this.ros = new ROSLIB.Ros({url: 'ws://' + this.rosIP})

    this.ros.on('connection', () => {
      console.log('Connecting to ROS ' + this.rosIP)
      this.init()
    })

    this.ros.on('error', (error) => {
      console.log('Error while connecting to ROS: ', error)
      this.ros.close()
      delete this
    })

    this.ros.on('close', () => {
      console.log('Closing websocket connection to ROS')
      delete this
    })
  }

  delete () {
    try {
      this.root.hide()
    } catch (err) {
      console.log(err)
    }
  }

  init () {
    var param = new ROSLIB.Param({
      ros: this.ros,
      name: 'robot_description'
    })

    // Why we need this???
    if (!param) {
      param = new ROSLIB.Param({
        ros: this.ros,
        name: '/robot_description'
      })
    }

    param.get((param) => {
      var tf2Client = new ROSLIB.Topic({
        ros: this.ros,
        name: '/tf',
        messageType: 'tf2_msgs/TFMessage'
      })

      tf2Client.subscribe((message) => {
        console.log(JSON.stringify(message))
      })
    })
  }
}

module.exports = RobotSubscriber

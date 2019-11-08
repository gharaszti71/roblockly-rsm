const RobotSubscriber = require('./robot-subscriber.js')

// VPS in AWS running an UR5 ROS setup
const options = {
  name: 'ur_description',
  rosIP: '52.59.153.65:50000',
  baseLink: 'base_link'
}

tester = new RobotSubscriber(options)

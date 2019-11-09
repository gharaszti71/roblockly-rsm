'use strict';

const ROSLIB = require('roslib');
const process = require('process');

const rosIP = '127.0.0.1:9090';

const ros = new ROSLIB.Ros({ url: 'ws://' + rosIP });

ros.on('connection', () => {
  console.log('Connecting to ROS ' + rosIP);

  //TODO: DECIDE WETHER WE NEED TO CHECK FOR TF TOPIC OTHERWISE EXIT HERE

  var param = new ROSLIB.Param({
    ros,
    name: 'robot_description'
  });

  // Why we need this???
  if (!param) {
    param = new ROSLIB.Param({
      ros: ros,
      name: '/robot_description'
    });
  }

  param.get(param => {
    var tf2Client = new ROSLIB.Topic({
      ros,
      name: '/tf',
      messageType: 'tf2_msgs/TFMessage'
    });

    tf2Client.subscribe(message => {
      process.exit(0);
    });
  });
});

ros.on('error', error => {
  console.log('Error while connecting to ROS: ', error);
  ros.close();
  process.exit(1);
});

ros.on('close', () => {
  console.log('Closing websocket connection to ROS');
  process.exit(1);
});

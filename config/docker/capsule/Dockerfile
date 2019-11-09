FROM ubuntu:16.04

ARG DEBIAN_FRONTEND=noninteractive

# Munkakönyvtár a /tmp
WORKDIR /tmp

# szükséges csomagok telepítése
RUN apt-get update && \
	apt-get install -y runit openjdk-8-jre xvfb mesa-utils curl libssl-dev psmisc vim supervisor

# UR Sim telepítése
RUN mkdir -p /URSim
ADD URSim_Linux-3.8.0.61336.tar.gz /URSim
WORKDIR /URSim/ursim-3.8.0.61336
RUN /bin/bash -c "sed -i 's/sudo //g' install.sh;sed -i 's/pkexec //g' install.sh;sed -i '16,17d' install.sh;sed -i '42,49d' install.sh;sed -i '76,87d' install.sh;sed -i '75,81d' install.sh"
RUN	/bin/bash -c "./install.sh"

# ROS telepítése, konfigurálása
RUN echo "deb http://packages.ros.org/ros/ubuntu xenial main" > /etc/apt/sources.list.d/ros-latest.list && \
	apt-key adv --keyserver hkp://ha.pool.sks-keyservers.net:80 --recv-key 421C365BD9FF1F717815A3895523BAEEB01FA116 && \
	apt-get update && \
	apt-get -y install ros-kinetic-ros-base && \
	rosdep init && \
	rosdep update && \
	echo "source /opt/ros/kinetic/setup.bash" >> /root/.bashrc && \
	/bin/bash -c "source /root/.bashrc" && \
	apt-get -y install python-rosinstall python-rosinstall-generator python-wstool build-essential

# ROS komponensek telepítése
RUN apt-get -y install ros-kinetic-rosbridge-suite ros-kinetic-joint-state-publisher ros-kinetic-tf2-web-republisher ros-kinetic-xacro ros-kinetic-robot-state-publisher

# NodeJs 8.x telepítése
RUN curl -sL https://deb.nodesource.com/setup_8.x -o nodesource_setup.sh && \
	bash nodesource_setup.sh && \
	apt-get install -y nodejs && \
	rm nodesource_setup.sh

# ROS csomagok klónozása és buildelése
RUN mkdir -p /root/catkin_ws/src
WORKDIR /root/catkin_ws/src
RUN git clone https://github.com/ros-industrial/universal_robot.git
WORKDIR /root/catkin_ws/src/universal_robot
RUN rm -drf README.md universal_robot universal_robots ur10* ur3* ur5* ur_bringup ur_driver ur_e_* ur_gazebo ur_kinematics
WORKDIR /root/catkin_ws
RUN /bin/bash -c '. /opt/ros/kinetic/setup.bash; cd /root/catkin_ws; catkin_make' &&\
	echo "source /root/catkin_ws/devel/setup.bash" >> /root/.bashrc && \
	/bin/bash -c "source /root/.bashrc"
	
WORKDIR /root
RUN git clone https://github.com/ABC-iRobotics/ur-state-receiver.git
WORKDIR /root/ur-state-receiver
RUN npm install
WORKDIR /root
RUN git clone https://github.com/ABC-iRobotics/ur-ros-state-server.git
WORKDIR /root/ur-ros-state-server
RUN npm install
COPY ur5.launch /root/catkin_ws/src/universal_robot/ur_description/launch
WORKDIR /root/catkin_ws/src
RUN curl -sL https://github.com/ABC-iRobotics/fanuc-web2ros/blob/master/dependencies/joint_state_publisher_js-hydro.tar.gz?raw=true -o joint_state_publisher_js-hydro.tar.gz && \
	tar xzf joint_state_publisher_js-hydro.tar.gz && \
	rm joint_state_publisher_js-hydro.tar.gz
	
WORKDIR /root/catkin_ws
RUN /bin/bash -c '. /opt/ros/kinetic/setup.bash; cd /root/catkin_ws; catkin_make'

# Supervisord telepítése és futtatása
WORKDIR /root

COPY healthcheck.js .
HEALTHCHECK --interval=5s --timeout=150s --start-period=1s --retries=3 CMD [ "node","healthcheck.js" ]

COPY supervisord.conf /root
ENTRYPOINT ["/usr/bin/supervisord","-c","/root/supervisord.conf"]

# Használt portok
EXPOSE 30002/tcp
EXPOSE 9090/tcp   
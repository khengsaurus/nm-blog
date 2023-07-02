#!/bin/bash

if [ "$#" -ne 2 ] || ! [[ "$2" =~ ^[0-9]{4}$ ]]; then
  echo "Error: please enter 1) a tag 2) a 4-digit port number"
  exit 1
fi

# -------------------------

APP="nm-server"

# Build app image if not exists
if [[ "$(docker images -q $APP:$1 2> /dev/null)" == "" ]]; 
  then docker build . -t $APP:$1
fi

function _run(){
  CONTAINER=$APP-$1
  APP_NAME=$APP:$1
  if [[ $(docker container ps | grep $CONTAINER) ]]; then
    return
  elif [[ $(docker container ls -a | grep $CONTAINER) ]]; then
    echo "Starting stopped container $CONTAINER"
    docker container start $CONTAINER
  else
    echo "Creating new container $CONTAINER"
    docker run \
      --name $CONTAINER \
      --hostname $CONTAINER \
      -p $2:8080 \
      -d \
      $APP_NAME
  fi
}

_run $1 $2
#!/bin/sh

if [ $(ps -e -o uid,cmd | grep $UID | grep node | grep -v grep | wc -l | tr -s "\n") -eq 0 ]
then
        export PATH=/usr/local/bin:$PATH
        forever start --sourceDir /home/stuff2get/www/ng-stuff-mgo/api server2.js >> /var/log/forever/log.txt 2>&1
fi

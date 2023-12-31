#!/bin/bash

# Compile svelte frontend and copy to node service
cd ./frontend/
if [ ! -d "node_modules" ] 
then
    npm install
fi
npm run build
cd ..
rm -Rf ./api/fe
mv ./frontend/build ./api/fe

# Generate SQL for Postgres docker image
rm -f ./deployments/db.sql
echo -e "/* This is an autogenerated file generated by executing build.sh. \n   Do not edit this file as your changes will be overwritten */ \n" > ./deployments/db.sql
cat ./db/schema.sql >> ./deployments/db.sql
cat ./db/demo_data.sql >> ./deployments/db.sql

echo "Completed"
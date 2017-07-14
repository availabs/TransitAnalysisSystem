# Transit Analysis System

## Requirements

### Node.js

This project uses JavaScript features available only in
  version 8.0.0, and higher, of Node.

I highly recomments the [n](https://github.com/tj/n) project
  if you do not currently use a Node version management system.

---

## Configuration

Install the JavaScript dependencies

``` bash
npm install
```

### GTFS Static Data

The `src/bin/updateGTFSData.js` script will download and index the GTFS Static data.

This script takes 2 command line arguments:

* `--feedName`

  This is the name of the feed. There should be a corresponding feed configuration
  file in `src/config/feeds/`,

* `--sourceType`

  If the `gtfs.zip` file is already on the system, you can tell the updater
  to use that file rather than download a new one. The path to this file
  is specified in the feed configuration file mentioned above.

* Example usage

  ``` bash
   ./src/bin/updateGTFSData.js --feedName=mta_subway --sourceType=file
  ```

### Configuring MongoDB

For easy development, this repo contains a `docker/` directory
set up to deploy MongoDB in a container.

NOTE: A remote MongoDB host and port can be specified in
`config/mongo/MongoHostConfigDefaults.js`

* [Install Docker](https://docs.docker.com/engine/installation/)
* [Install Docker Compose](https://docs.docker.com/compose/install/)

First,

``` bash
cp src/config/secrets.js.template src/config/secrets.js
```

Then, **set the adminUser, readOnlyUser, and readWriteUser passwords in src/config/secrets.js**.

Before running the `src/bin/createMongoUsers.js` script, we need to turn off authentication.
To do this, comment out the following line in the `docker/docker-compose.yml` file:

```
command: mongod --auth
```

should become

```
#command: mongod --auth
```

Start up the MongoDB instance:

``` bash
cd docker/ && ./up.sh
```

Now run

``` bash
./src/bin/createMongoUsers.js
```

You should have gotten a 'success' message.

Now we can enable authentication to secure the MongoDB server.

Bring down the MongoDB instance:

``` bash
cd docker/ && ./down.sh
```

Uncomment the command in docker/docker-compose.yml

```
#command: mongod --auth
```

is retored to

```
command: mongod --auth
```

Restart Mongo

``` bash
./src/bin/createMongoUsers.js
```

Test connecting with the new users

```
./node_modules/.bin/mocha tests/config/mongo/connectToMongo.test.js
```

NOTE: You can use the `docker/attachToMongoContainerWithBash.sh` script
to open a bash shell inside of the Docker container.

For further reference:

* [DockerHub Repo](https://hub.docker.com/_/mongo/)

## Memory requirements

Make sure the node processes have enough memory:

``` bash
node --max-old-space-size=7000 src/bin/uploadLiveMessages.js
```

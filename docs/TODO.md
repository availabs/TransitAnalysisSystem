# TransitAnalysisSystem TODO list

---

## Immediate Tasks

1. Was this change valid?

    vi +585 /home/paul/AVAIL/specialRequests/NYT_MTA/TransitAnalysisSystem/node_modules/GTFS_Toolkit/lib/spatialDataIndexer.js

1. Handler/Conveter factories should additionally take the options param
    that is passed to the Config Factories. If the config param is not instanceof
    the config class, then call the config factory from within the handler factory.

1. Log rotation

1. Upgrade [ProtoBuf.js](https://github.com/dcodeIO/ProtoBuf.js/)

  NOTE: API changed. [Using .proto files](https://github.com/dcodeIO/ProtoBuf.js/#using-proto-files)

1. Need to create something that composes actors from a config/blueprint.

---

## MTA Buses

[GTFS-Realtime Support](http://bustime.mta.info/wiki/Developers/GTFSRt)

---

## Interprocess Communication

  Because of the scraper/uploader's 'hiccup',
    the scraper/uploader and the TransitAnalysisServer
    must be on separate processes.

  However, we want the server to know when a new
    GTFS-Realtime message has been received and parsed.

  One way to handle this would be for the scraper to
    send posts to the server.

  If we go intermodal/interagency, this will be essential.

  A single Node process would grind to a halt under that much computation.

### Look into

* [Node-ipc](https://riaevangelist.github.io/node-ipc/)

  This tool will enable us to really get the most out of
    using the [Actor Model](https://en.wikipedia.org/wiki/Actor_model).

  * [The actor model in 10 minutes](http://www.brianstorti.com/the-actor-model/)
  * [Hewitt, Meijer and Szyperski: The Actor Model](https://youtu.be/7erJ1DV_Tlo)
  * [Actor-based Concurrency](https://berb.github.io/diploma-thesis/original/054_actors.html)
  * [Why has the actor model not succeeded?](https://www.doc.ic.ac.uk/~nd/surprise_97/journal/vol2/pjm2/)

  Intermodal/inter-agency anomaly detection/reporting
    with loose coupling and high cohesion.

---

## Stretch

* Provide a callback API in addition to the Promises API.

* Provide a Stream API in addition to the Promises API.

  * TransformStream-based GTFS, GTFSrt, and ConversionService

    It would allow piping across processes/machines, broadcasting,
      and near limitless extensibility.

    * [Stream Handbook](https://github.com/substack/stream-handbook)
    * [Power of Streams](https://youtu.be/GaqxIMLLOu8?t=9m30s)

* SIRI feed handlers for the MTA buses.

* An API route to download a ZIP archive of GTFSrt messages

  * See: [Node.js script to make a zip archive](https://mushfiq.me/2014/08/21/node-js-script-to-make-a-zip-archive/)

  * [archiver](https://archiverjs.com/docs/)

    * `append` objects from the Cursor stream as Buffers
    * `finalize` when the Cursor stream is done.

  * The Idea:

    Create a child process for this task.

    Redirect the child process'

    * STDIN to the Cursor Stream
    * STDOUT to the HTTP response object.

    Within the archiving process, a Transform Stream with

    * `readableObjectMode` set to true
    * `writableObjectMode` set to false

* [Geospatial Queries](https://docs.mongodb.com/v3.2/geospatial-queries/)




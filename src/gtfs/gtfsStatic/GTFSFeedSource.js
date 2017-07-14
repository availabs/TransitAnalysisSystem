/*
 * NOTE: When we start to handle the MTA historial data,
 *         we will need to make sure the GTFS data
 *         is in sync with the GTFSrt messages.
 *
 *       To do this, we can use the hot update capabilities
 *          of the GTFS FeedHandler and the Converter.
 *
 *        Reading in the massive indexedScheduleData file takes minutes.
 *
 *        A prefered implementation would be to use a data storage
 *          system to retrieve only the needed information to
 *          process each message.
 *
 *        Using MongoDB,
 *           It looks as though this would require using `$project (aggregation)`:
 *             https://docs.mongodb.com/manual/reference/operator/aggregation/project/
 * SEE: 
 *   TL;DR
 *     
 *     We will want to have an update method on this Feed Handler which takes
 *       the new indices objects. Inside of this method, send the listeners
 *       the indices, per the original GTFS Feed Handler interface contract.
 *
 *   https://github.com/availabs/GTFS_Toolkit/blob/master/lib/FeedHandler.js#L93-L111
 *   https://github.com/availabs/MTA_Subway_GTFS-Realtime_to_SIRI_Converter/blob/master/lib/ConverterStream.js#L63-L67
 */


'use strict'

const Enum = require('enumify').Enum


class GTFSFeedSource extends Enum {}

GTFSFeedSource.initEnum([
  'FILE'
])


module.exports = GTFSFeedSource

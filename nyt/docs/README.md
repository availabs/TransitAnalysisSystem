# MTA Subway GTFS Realtime Feed Notes

## Reference Documentation

* [GTFS Static Overview](https://developers.google.com/transit/gtfs/)

* [GTFS Realtime Overview](https://developers.google.com/transit/gtfs-realtime/)

* [GTFS-realtime Reference for the New York City Subway](http://datamine.mta.info/sites/all/files/pdfs/GTFS-Realtime-NYC-Subway%20version%201%20dated%207%20Sep.pdf)

## Notes on the *'GTFS-realtime Reference for the New York City Subway'*

* pg 4: message TripUpdate

  > The feed contains all revenue trips that are either:
  > * already underway (assigned trips), or
  > * scheduled to start in the next 30 minutes (unassigned trips)
  >
  > Trips are usually assigned to a physical train
  > a few minutes before the scheduled start time,
  > sometimes just a few seconds before.

* pg 5: message TripDescriptor

  > While trip\_id in the GTFS-realtime feed will not directly match the trip\_id
  > in trips.txt, a partial match should be possible if the trip has been defined
  > in trips.txt. If there is a partial match, the trip is a scheduled trip.  For
  > example, if a trip\_id in trips.txt is A20111204SAT\_021150\_2..N08R, the
  > GTFS-realtime trip\_id will be 021150\_2..N08R which is unique within the day
  > type (WKD, SAT, SUN).

  When processing the GTFS Static data for use with the GTFS Realtime,
  the first 9 characters are removed from the `trip_id` in *trips.txt*.

  In JavaScript, the code would be:

  ``` JavaScript
    let tripID = 'A20111204SAT_021150_2..N08R'.replace(/.{9}/, '') // 'SAT_021150_2..N08R'
  ```

  Note that this will leave the day-type/service-code *(WKD, SAT, SUN)*
  in addition to the substring *(021150\_2..N08R)* that will match the
  GTFS Realtime trip_id of the trip.

  To match the realtime trip to the scheduled trip

  1. we determine the day type of the trip

    See the paragraph beginning with
    *'021150 – This identifies the trips origin time.'*
    on page 5 of the Reference document for details.

  1. then prefix the day type to the GTFS Realtime trip\_id.

    ``` JavaScript
      let gtfsTripKey = `${dayType}_gtfsrtTripID` // 'SAT_021150_2..N08R'
    ```

    The gtfsTripKey can be used to match the realtime trip to the static schedule.

* pg 8: message StopTimeUpdate

  > Note that the predicted times are not updated when the train is not moving.
  > Feed consumers can detect this condition using the timestamp in
  > the VehiclePosition message.

* pg 9: message VehiclePosition

  > VehiclePosition entity is provided for every trip when it
  > starts moving. Note that a train can be assigned (see
  > TripUpdate) but has not started to move (e.g. a train
  > waiting to leave the origin station), therefore, no
  > VehiclePosition is provided.
  >
  > *Usage notes:*
  >
  > The motivation to include VehiclePosition is to
  > provide the timestamp field. This is the time of the last
  > detected movement of the train. This allows feed consumers
  > to detect the situation when a train stops moving (aka stalled).
  >
  > [...]
  >
  > Note: since VehiclePosition information is not provided until the
  > train starts moving, it is recommended that feed consumers use
  > the origin terminal departure to determine a train stalled condition.

## Potentially useful code

* [GTFS\_Toolkit/lib/WrapperAPI.js](https://github.com/availabs/GTFS_Toolkit/blob/master/lib/WrapperAPI.js)

* [GTFS-Realtime\_Toolkit/lib/WrapperAPI.js](https://github.com/availabs/GTFS-Realtime_Toolkit/blob/master/lib/WrapperAPI.js)

The above linked JS code show the wrappers classes
built for the GTFS Static and GTFS Realtime data.

If you use the FeedReplay system, these wrapper classes
will be available to you to use in your analysis.



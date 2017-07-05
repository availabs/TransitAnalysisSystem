
Configuration:
  set `gtfs.indexStopTimes = true` in node\_module/MTA\_Subway\_SIRI\_Server/config/mta\_subway.json

```
sed -i 's/indexStopTimes = true/indexStopTimes = false/g' node_module/MTA_Subway_SIRI_Server/config/mta_subway.json
```

```
./bin/updateGTFSDate.sh
```

Make sure the node processes have enough memory:
  node --max-old-space-size=7000 bin/uploadLiveMessages.js



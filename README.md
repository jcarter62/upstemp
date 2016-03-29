# upstemp

Intended to expose temperature values via nginx site from APC UPS units with environmental monitors.  
The site initially has two functions, (1) load values via snmp, and (2) display the values via http.

To use this application, user or sys admin would create a json file for each ups, and specify the oid values 
for each data item with suffix of oid.  Here is an example.

```
{
  "ups": {
      "ip": "192.168.5.99",
      "nameoid": "1.3.6.1.2.1.1.5.0",
      "locationoid": "1.3.6.1.2.1.1.6.0",
      "tempoid": "1.3.6.1.4.1.318.1.1.10.2.3.2.1.4.1"
  }
}
```

When the user performs the /load function, the input directory should be interrogated, and similar files in results 
should be created.  The /show function then loads the results, and displays current temperature and related data.


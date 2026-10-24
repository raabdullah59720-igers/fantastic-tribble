# Ozone & Space Environment Module: source notes

## NASA Ozone Watch

NASA Ozone Watch publishes satellite-derived total-column ozone maps, daily/monthly archives, animations and seasonal context. Total ozone is reported in Dobson Units (DU). NASA notes that 300 DU is equivalent to a compressed pure-ozone column about 3 mm thick at standard temperature/pressure. The app's default 300 DU is an illustrative input only; it is not a current measurement over Bangladesh. The 220 DU threshold has a specific historical use in defining the Antarctic ozone-hole area and must not be treated as a universal health or local-Bangladesh alert threshold.

Sources: https://ozonewatch.gsfc.nasa.gov/ · https://ozonewatch.gsfc.nasa.gov/monthly/ · https://ozonewatch.gsfc.nasa.gov/facts/dobson_SH.html

## Atmosphere layers

The canvas layer scene and ozone profile are explanatory diagrams with exaggeration for legibility. They do not reconstruct a measured atmospheric vertical profile. Approximate layer boundaries vary with latitude, season and how the layer is defined. NASA reference: https://www.nasa.gov/image-article/earths-atmospheric-layers-3/

## Solar activity

The Solar Activity panel requests recent FLR, CME and GST records from the NASA CCMC DONKI web service. Each provider record retains its timestamp and link. The app does not infer that a CME is Earth-directed, and it does not convert a catalogue event into an official warning. DONKI describes its near-real-time analyses and model outputs as research/prototyping quality. Source: https://ccmc.gsfc.nasa.gov/tools/DONKI/ and https://ccmc.gsfc.nasa.gov/DONKI/guide/events/

## Near-Earth objects

The object list uses NASA NeoWs Feed API records for one UTC date per request. The “potentially hazardous” label is a catalog attribute; it does not mean impact is predicted. The display's orbit geometry is schematic, not an ephemeris. The NASA DEMO_KEY has lower request limits than a registered API key. Source: https://api.nasa.gov/

## Data-handling principles

- Network failures are reported as unavailable/degraded, never replaced by pretend live readings.
- Last successful fetch time is shown separately from event observation/approach timestamps.
- The ozone calculator labels user-entered values and does not estimate local ozone from a generic number.
- Animated canvases are visual explanations only, not sensor measurements or forecast outputs.

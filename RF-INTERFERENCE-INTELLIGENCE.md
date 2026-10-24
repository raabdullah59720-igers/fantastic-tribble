# RF Spectrum & Interference Intelligence

## What this module does

- Presents a high-resolution **synthetic** spectrum trace with clean-channel, adjacent-channel, broadband-noise, burst-noise and fading scenarios.
- Calculates approximate combined noise/interference power, modeled SNR and the Shannon capacity upper bound.
- Imports a local receiver/SDR CSV export in read-only mode; the file is not uploaded to a server.
- Flags spectral peaks as review candidates. A peak is not proof of intentional jamming, location of an emitter, or attribution to an actor.
- Exports a JSON analysis report and can add a local review item to this tab's session-scoped incident log.

## Important boundary

This is a **receive-only, non-transmitting** panel. It contains no jammer/transmitter controls, radio-control API, signal-spoofing function, or instructions for interfering with operational radio systems. Virtual interference scenarios affect only the visualization and mathematical model in the browser. Real observations require an authorized RF receiver, SDR or documented read-only sensor interface.

ITU explains that harmful interference can degrade or obstruct communications and radionavigation services, and that radio stations must not cause harmful interference. Bangladesh radio equipment usage and import may require BTRC approvals/authorization. See the official references below.

- ITU harmful-interference guidance: https://www.itu.int/en/mediacentre/backgrounders/Pages/radio-interference.aspx
- ITU Radio Regulations: https://www.itu.int/pub/R-REG-RR
- Bangladesh Telecommunication Regulatory Commission: https://btrc.gov.bd/

## Equations and assumptions

Power levels expressed in dBm cannot be added arithmetically. For noise floor `N` and simulated interference power `I`, the combined level is computed by converting dBm to linear power, summing, and converting back:

`P_combined(dBm) = 10 log10(10^(N/10) + 10^(I/10))`

`SNR(dB) = P_signal(dBm) - P_combined(dBm)`

`C = B log2(1 + 10^(SNR/10))`

`C` is an idealized Shannon capacity bound, not measured goodput or an actual radio link's performance. The slider-to-interference mapping is illustrative and not calibrated to a physical transmitter or jammer.

## CSV import format

Header must contain `frequency_mhz,power_dbm`, with at least two numeric sample rows. The parser limits imports to 2 MiB and 5,000 samples. Keep source metadata (device, antenna, calibration, gain, RBW/VBW, detector mode, timestamp, and frequency settings) separately so results can be interpreted correctly. The app does not infer missing calibration metadata.

Example:

```csv
frequency_mhz,power_dbm
2390.0,-101.2
2400.0,-99.8
2410.0,-80.1
2420.0,-100.4
```

Peak detection is a simple heuristic for triage. Use appropriate calibrated equipment, approved operating procedures, repeat measurements and provider/regulator coordination for suspected harmful interference.

## QA

Run the dependency-free focused logic/UI harness with Node.js:

```sh
node tests/test-rf-interference-intelligence.cjs
```

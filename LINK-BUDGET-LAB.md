# Emergency Connectivity Link Budget Lab

This panel is an engineering calculator and animated explanatory view. Its path graphic is illustrative; it does not connect to a radio, antenna, satellite payload, or provider network.

## Inputs and equations

- Frequency `f_MHz`; convert to `f_GHz = f_MHz / 1000`.
- Slant range `d_km`; user must provide a realistic path range for the orbit/service being studied.
- Transmitter power `P_W`, transmit antenna gain `G_tx` dBi, receive antenna gain `G_rx` dBi, aggregate losses `L_total` dB, and receiver sensitivity `S_rx` dBm.

Free-space path loss:

`FSPL(dB) = 92.45 + 20 log10(f_GHz) + 20 log10(d_km)`

EIRP:

`EIRP(dBW) = 10 log10(P_W) + G_tx(dBi)`

Estimated receive power:

`P_rx(dBm) = EIRP(dBW) + G_rx(dBi) - FSPL(dB) - L_total(dB) + 30`

Link margin:

`Margin(dB) = P_rx(dBm) - S_rx(dBm)`

## Example reference result

Defaults in the panel are illustrative: 14,000 MHz, 38,000 km, 10 W, 42 dBi transmit gain, 40 dBi receive gain, 8 dB aggregate losses and -110 dBm receiver sensitivity. Expected values are approximately 206.97 dB FSPL, 52.00 dBW EIRP, -92.97 dBm receive power and +17.03 dB margin.

## Scope and limits

A positive model margin is not an actual connection or guarantee of service. A complete satellite link budget also requires legal/assigned carrier frequency, bandwidth, modulation and coding, antenna pointing/polarization, receiver noise temperature, G/T, rain fade statistics, interference, implementation losses, terminal certification, uplink/downlink asymmetry, provider scheduling and authorization. The panel intentionally does not estimate real-world service availability or manufacture provider credentials.

Russian satellite provider tokens, VPN credentials, terminals, airtime and subscription are not obtainable/generated from public orbital data by this web app. Use only credentials issued to you by the provider or your approved VPN service.

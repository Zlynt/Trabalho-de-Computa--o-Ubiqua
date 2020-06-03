# Project for the Ubiquitous computing discipline in University of Madeira

## What is this project
This project is a different approach to how we authenticate on a certain website. In 2020 the username and password combination based authentication is vulnerable to dictionary attacks based on the data leaked from data breaches. To help mitigate this issue, it was introduced in the market 2-factor-authentication authentication mechanism. The 2-factor-authentication can be defeated by using the "SIM-SWAP" technique, using SS7 to spoof phone number, voice mail hack by using default voice mail password, and by compromising the user's phone.

This project is a prototype demoing the idea behind this project. We use 2 cryptographic algorithms. The first one is ECDSA. This algorithm will be used to identify the user on the web. The ECDSA's public key is used to identify the user on the web and the private key is used to sign the data. The RSA algorithm is used to identify the server. The RSA's public key is used to sign the data sent to the server and the private key is used by the server to read the data. ECDSA's and RSA'a private keys must be kept secret by his owner.

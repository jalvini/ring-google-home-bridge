#!/usr/bin/env node
'use strict';

// TODO Remove these environment variables
process.env.RING_USER = '****';
process.env.RING_PASSWORD = '****';
const GoogleHome = require("google-home-push");

// Pass the name or IP address of your device
const googleHome1 = new GoogleHome("192.168.5.185");
const googleHome2 = new GoogleHome("192.168.5.165");
const googleHome3 = new GoogleHome("192.168.5.206");

const ringApi = require( './node_modules/ring-api/main.js' );
const { healthSummary, historySummary } = require( './formatters' );
const { inspect } = require( 'util' );
const colors = require( 'colors/safe' );

let username = process.env.RING_USER;
let password =  process.env.RING_PASSWORD;

// TODO run the components inside of this function in order to start creation of an interface
const hitGoogleHome = () => {
    console.log("Function Hit");
};

const main = async() => {

    let ring;
    try {
        ring = await ringApi({
            username, password
        })
    } catch ( e ) {
        console.error( e );
        console.error( colors.red( 'We couldn\'t create the API instance. This might be because ring.com changed their API again' ));
        console.error( colors.red( 'or maybe your password is wrong, in any case, sorry can\'t help you today. Bye!' ));
        return
    }

    try {
        console.log( '🎵active dings now are', await ring.activeDings());

        const devices = await ring.devices();

        console.log( '📹details for latest live stream:\n', inspect( await devices.doorbells[ 0 ].liveStream, { colors: true }));

        const healthSummaries = await Promise.all( devices.all.map( healthSummary ));
        console.log( '\nDevice Healths\n===============\n', healthSummaries.join( '\n' ));

        const history = await ring.history();
        console.log( historySummary( history ));

        const videos = await Promise.all( history.map( h => h.videoUrl()));
        console.log( `your most recent 3 videos 📹 are at...\n\t ${videos.slice( 0, 3 ).join( '\n\t' )}` );

        ring.events.on( 'activity', () => {
            googleHome1.speak("Someone is at your front door");
            googleHome2.speak("Someone is at your front door");
            googleHome3.speak("Someone is at your front door");
        });
        console.log();
        console.log( 'now listening for dings, they will log here until you kill this script. Go press your doorbell!' )
    } catch ( e ) {
        console.error( e )
    }
};

main();
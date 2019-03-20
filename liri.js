require("dotenv").config();

var keys    = require("./keys.js");
var Spotify = require('node-spotify-api');
var moment  = require('moment');
var axios   = require('axios');
var fs      = require("fs");

var spotify   = new Spotify(keys.spotify);
var userInput = process.argv;

if(userInput.length > 2){

    var userCommandChoice = userInput[2];
    // create a new array of all the user inputs after the command 
    // and join them as a string seperated by a space
    var arg2 = userInput.slice(3, userInput.length).join(' ');

    liri(userCommandChoice)
    
    // evaluate the users command choice and run the corresponding function 
    function liri(userCommandChoice){
        switch(userCommandChoice){
            case `concert-this`:
                if(validateUserInput()){
                    concertThis()
                }else {
                    console.log('please input artist/band name after liri command!');
                    return
                }
                
            break;
            case `spotify-this-song`:
                if(validateUserInput()){
                    spotifyThis()
                }else {
                    arg2 = 'The Sign'
                    spotifyThis();
                }
            break;
            case `movie-this`:
                if(validateUserInput()){
                    movieThis();
                }else {
                    console.log('please input movie name after liri command!');
                    return
                }
            break;
            case `do-what-it-says`:
                liriChoice();
            break;
            default:
                console.log('OOPS! I do not know that command. please choice from: \n concert-this \n spotify-this-song \n movie-this \n do-what-it-says');
            break;
        }
    }
    
    // get event data for user choice of artist/band
    // display event data for the first 5 results
    function concertThis(){        
        axios.get('https://rest.bandsintown.com/artists/' + arg2 + '/events?app_id='+ keys.bandsintown.apiKey)
        .then(function (response) {
            var bandsInTown = response.data
            // request return 20 results
            // only use data from the first 5 
            if(bandsInTown.length>0 && Array.isArray(bandsInTown)){
                console.log('\n##########################')
                console.log('\nconcert-this =>', arg2)
                console.log('\n------------------------')
                for(var i = 0; i<5; i++) {
                    console.log('\n')
                    console.log('**************************')
                    console.log('Venue Name:',bandsInTown[i].venue.name)
                    console.log('Venue Location:', bandsInTown[i].venue.city +", "+ bandsInTown[i].venue.country)
                    console.log('Event Date:', moment(bandsInTown[i].datetime).format('MM/DD/YYYY'))
                    console.log('**************************')
                    console.log('\n')
                }
                console.log('\n##########################')
                    console.log('\n')
            } else {
                console.log('\n##########################')
                console.log('\nspotify-this-song =>', arg2)
                console.log('\n------------------------')
                console.log('\n')
                console.log('Sorry, no upcoming events are listed for this artist/band. \nPlease try another!')
                console.log('\n##########################')
                console.log('\n')
                return
            }
        })
        .catch(function (error) {
            return console.log('Error occurred: please try again O_o');
        });
    }
    
    // get song data for user choice of song by title
    // display the first result for the song data 
    function spotifyThis(){
        spotify.search({ type: 'track', query: arg2}, function(err, data) {
            if (err) {
              return console.log('Error occurred: please try again O_o');
            }
            if(data.tracks.items.length>0) {
                console.log('\n##########################')
                console.log('\nspotify-this-song =>', arg2)
                console.log('\n------------------------')
                console.log('\n')
                console.log('Artist:', data.tracks.items[0].artists[0].name)
    
                console.log('Song Name:', data.tracks.items[0].name);
                
                console.log('Spotify Song Link:', data.tracks.items[0].album.external_urls.spotify);
    
                console.log('Album Name:', data.tracks.items[0].album.name);
                console.log('\n')
                console.log('##########################')
                console.log('\n')
            }else {
                console.log('\n##########################')
                console.log('\nconcert-this =>', arg2)
                console.log('\n------------------------')
                console.log('\n')
                console.log('OOPS, something went wrong! Please try again with another song title.')
                console.log('\n')
            }
        });
    }
     
    // get movie data for the user choice of movie by title
    // display movie data
    function movieThis(){
        axios.get('http://www.omdbapi.com/?t=' + arg2 + '&y=&plot=full&tomatoes=true&apikey='+ keys.omdb.apiKey)
        .then(function (response) {
            var movieData = response.data
            if(movieData.Response === 'True'){
                console.log('\n##########################')
                console.log('\nmovie-this =>', arg2)
                console.log('\n------------------------')
                console.log('Title:', movieData.Title)
                console.log('Release Date:', movieData.Year)
                console.log('IMDB Rating:', movieData.imdbRating)
                console.log('Rotten Tomatoes Rating:', movieData.tomatoRating)
                console.log('Language:', movieData.Language)
                console.log('Plot:', movieData.Plot)
                console.log('Actors:', movieData.Actors)
                console.log('\n##########################')
                console.log('\n')
            }else {
                console.log('\n##########################')
                console.log('\nmovie-this =>', arg2)
                console.log('\n------------------------')
                console.log('\n')
                console.log('OOPS, something went wrong! Please try again with another movie title.')
                console.log('\n')  
            }
           
        })
        .catch(function (error) {
            return console.log('Error occurred: please try again O_o');
        });

    }
    // read data from random.txt 
    // run spotifyThis function
    function liriChoice(){
        fs.readFile('random.txt', 'utf8', function(error, data) {
            if(error){
                return console.log('Error occurred: please try again O_o');
            }

            // if there is any data in the file read
            if(data.length > 0){
                // convert long string into an array
                var fileData = data.split(',')

                if(fileData.length >= 2) {
                    // reassign variable values
                    userCommandChoice = fileData[0];
                    arg2 = fileData[1];

                    // re run app with new variable values
                    liri(userCommandChoice);
                } else if(fileData.length === 1){
                     // reassign variable value
                    userCommandChoice = fileData[0];

                    // re run app with new variable values
                    liri(userCommandChoice);
                } 
            }else {
                console.log('\n##########################')
                console.log('\ndo-what-it-says')
                console.log('\n------------------------')
                console.log('\n')
                console.log('OOPS, something went wrong! Please try again.')
                console.log('\n')
            }
        })
    }

    // validate that the user input a command after the file name
    function validateUserInput(){
        if(arg2.length>0){
            return true
        }else {
            return false
        }
    }

}else {
    console.log('you must input a value');
}



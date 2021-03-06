"use strict";

//constant variables
/*
var YELP_BASE_URL = 'https://api.yelp.com/v2/';
var YELP_KEY = '8NLZMqVArVFyVvuX8YzevA';
var YELP_TOKEN = 'zFW3lJg7x9T6UBsh_jge1G2fYAMCGAj5';
var YELP_KEY_SECRET = 'xzgudmUA5jc63yzPJdJmti4wsR8';
var YELP_TOKEN_SECRET = 'hkOWjrFjeemGUtNSzN5f5TOywR4';
*/


// ModelData: Initial array of bookstores
var bookstores = [
    {

        name: "Borderlands Books",
        lat: 37.758996,
        lng: -122.421674,
        id: "4aa32a35f964a520904320e3"

    },
    {
        name: "Dog Eared Books",
        lat: 37.758608,
        lng: -122.421533,
        id: "49e79762f964a520d0641fe3"

    },
    {
        name: "Alley Cat Books",
        lat: 37.752733,
        lng: -122.412700,
        id: "4ebade6e9911053f4e3a4de7"

    },
    {
        name: "Modern Times Bookstore",
        lat: 37.752756,
        lng: -122.410575,
        id: "4dec0c1f22713dd973bdf528"

    },
    {
        name: "Adobe Books",
        lat: 37.752636,
        lng: -122.414802,
        id: "51f5b314498e7ce07169b2d1"

    }
];

//Initialize  Map
var map;
function initMap() {
    "use strict";
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 37.75899, lng: -122.42167},
        zoom: 15,
        disableDefaultUI: true
    });
    //Initialize ViewModel
    ko.applyBindings(new ViewModel());
}

function googleError() {
    "use strict";
    document.getElementById('map').innerHTML = "<h2>Refresh browser for Map to reload.</h2>";
}

// Place constructor
var Place = function (data) {
    this.name = ko.observable(data.name);
    this.lat = ko.observable(data.lat);
    this.lng = ko.observable(data.lng);
    this.id = ko.observable(data.id);
    this.marker = ko.observable();
    this.phone = ko.observable('');
    this.description = ko.observable('');
    this.address = ko.observable('');
    this.rating = ko.observable('');
    this.url = ko.observable('');
    this.canonicalUrl = ko.observable('');
    this.photoPrefix = ko.observable('');
    this.photoSuffix = ko.observable('');
    this.contentString = ko.observable('');
};


// ViewModel
var ViewModel = function () {
    var self = this;

    this.placeList = ko.observableArray([]);

    // Calling the Place constructor
    bookstores.forEach(function (placeItem) {
        self.placeList.push(new Place(placeItem));
    });

    // Initialize  infowindow
    var infowindow = new google.maps.InfoWindow({
        maxWidth: 200,
    });

    // Initialize marker
    var marker;

    self.placeList().forEach(function (placeItem) {

        // Set markers for each location
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(placeItem.lat(), placeItem.lng()),
            map: map,
            animation: google.maps.Animation.DROP
        });
        placeItem.marker = marker;

         //Yelp AJAX Request

        /**  * Generates a random number and returns it as a string for OAuthentication  * @return {string}  */
        /*
        function nonce_generate() {
            return (Math.floor(Math.random() * 1e12).toString()); }


            var yelp_url = YELP_BASE_URL + 'search/?term=' + storeItem.name() + '&location=San Francisco, CA';
            console.log(yelp_url);
            var parameters = {
              oauth_consumer_key: YELP_KEY,
              oauth_token: YELP_TOKEN,
              oauth_nonce: nonce_generate(),
              oauth_timestamp: Math.floor(Date.now()/1000),
              oauth_signature_method: 'HMAC-SHA1',
              oauth_version : '1.0',
              callback: 'cb'              // This is crucial to include for jsonp implementation in AJAX or else the oauth-signature will be wrong.
            };

            var encodedSignature = oauthSignature.generate('GET',yelp_url, parameters, YELP_KEY_SECRET, YELP_TOKEN_SECRET);
            parameters.oauth_signature = encodedSignature;

            var settings = {
              url: yelp_url,
              data: parameters,
              cache: true,                // This is crucial to include as well to prevent jQuery from adding on a cache-buster parameter "_=23489489749837", invalidating our oauth-signature
              dataType: 'jsonp',
              success: function(results) {
                var result = data.response.venue;

              },
              error: function() {
                infowindow.setContent('<h5>Yelp data is unavailable. Please refresh</h5>');
                document.getElementById("error").innerHTML = "<h4>Yelp data is unavailable. Please refresh.</h4>";
            }

            };

            // Send AJAX query via jQuery library.
            $.ajax(settings);
*/

        //Foursquare Ajax Call
        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/' + placeItem.id() +
            '?client_id=CSKDE4IFASY2PUY3O4XBCBSOPMCGDXSAD3QUUT0OYTWNQNTT&client_secret=0E0SAF4HP0GSKK4LVVFYLZ1QJ3YFZE45XSV4HD2LB0AVZVKB&v=20130815',
            dataType: "json",
            success: function (data) {
                var result = data.response.venue;


                // Results from Foursquare
                // https://discussions.udacity.com/t/foursquare-results-undefined-until-the-second-click-on-infowindow/39673/2
                var contact = result.hasOwnProperty('contact') ? result.contact : '';
                if (contact.hasOwnProperty('formattedPhone')) {
                    placeItem.phone(contact.formattedPhone || '');
                }

                var location = result.hasOwnProperty('location') ? result.location : '';
                if (location.hasOwnProperty('address')) {
                    placeItem.address(location.address || '');
                }

                var bestPhoto = result.hasOwnProperty('bestPhoto') ? result.bestPhoto : '';
                if (bestPhoto.hasOwnProperty('prefix')) {
                    placeItem.photoPrefix(bestPhoto.prefix || '');
                }

                if (bestPhoto.hasOwnProperty('suffix')) {
                    placeItem.photoSuffix(bestPhoto.suffix || '');
                }

                var description = result.hasOwnProperty('description') ? result.description : '';
                placeItem.description(description || '');

                var rating = result.hasOwnProperty('rating') ? result.rating : '';
                placeItem.rating(rating || 'none');

                var url = result.hasOwnProperty('url') ? result.url : '';
                placeItem.url(url || '');

                placeItem.canonicalUrl(result.canonicalUrl);


                //Infowindow
                //https://discussions.udacity.com/t/trouble-with-infowindows-and-contentstring/39853/14
                var contentString = '<div id="iWindow"><h4>' + placeItem.name() + '</h4><div id="pic"><img src="' +
                        placeItem.photoPrefix() + '115x115' + placeItem.photoSuffix() +
                        '" alt="Image Location"></div><p>Foursquare Page:</p><p>' +
                        placeItem.phone() + '</p><p>' + placeItem.address() + '</p><p>' +
                        placeItem.description() +
                        '</p><p><a href=' + placeItem.url() + '>' + placeItem.url() +
                        '</a></p><p><a target="_blank" href=' + placeItem.canonicalUrl() +
                        '>Foursquare Page</a></p><p><a target="_blank" href=https://www.google.com/maps/dir/Current+Location/' +
                        placeItem.lat() + ',' + placeItem.lng() + '>Directions</a></p></div>';


                google.maps.event.addListener(placeItem.marker, 'click', function () {
                    infowindow.open(map, this);

                   // Animation https://github.com/Pooja0131/FEND-Neighbourhood-Project5a/blob/master/js/app.js
                    placeItem.marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(function () {
                        placeItem.marker.setAnimation(null);
                    }, 500);
                    infowindow.setContent(contentString);
                });
            },
            // Alert the user on error. Set messages in the DOM and infowindow
            error: function (e) {
                infowindow.setContent('<h5>Refresh to load data again.</h5>');
                document.getElementById("error").innerHTML = "<h4>Refresh to load data again.</h4>";
            }
        });

        // Ajax error display
        google.maps.event.addListener(marker, 'click', function () {
            infowindow.open(map, this);
            placeItem.marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                placeItem.marker.setAnimation(null);
            }, 500);
        });
    });

    // Activate the appropriate marker when the user clicks a list item
    self.showInfo = function (placeItem) {
        google.maps.event.trigger(placeItem.marker, 'click');
        self.hideElements();
    };

    // Toggle the nav class based style
    // https://discussions.udacity.com/t/any-way-to-reduce-infowindow-content-on-mobile/40352/25
    self.toggleNav = ko.observable(false);
    this.navStatus = ko.pureComputed (function () {
        return self.toggleNav() === false ? 'nav' : 'navClosed';
        }, this);

    self.hideElements = function (toggleNav) {
        self.toggleNav(true);
        // Allow default action
        // Credit Stacy https://discussions.udacity.com/t/click-binding-blocking-marker-clicks/35398/2
        return true;
    };

    self.showElements = function (toggleNav) {
        self.toggleNav(false);
        return true;
    };


    //Search Markers
    self.visible = ko.observableArray();

    // Visible Markers
    self.placeList().forEach(function (place) {
        self.visible.push(place);
    });


    self.userInput = ko.observable('');


    self.filterMarkers = function () {
        // Set all markers and places to not visible.
        var searchInput = self.userInput().toLowerCase();
        self.visible.removeAll();
        self.placeList().forEach(function (place) {
            place.marker.setVisible(false);
            // Compare the name of each place to user input
            // If user input is included in the name, set the place and marker as visible
            if (place.name().toLowerCase().indexOf(searchInput) !== -1) {
                self.visible.push(place);
            }
        });
        self.visible().forEach(function (place) {
            place.marker.setVisible(true);
        });
    };

};
exports.getWeatherData = function() {
    return {
        locations: [
            {
                name: 'Portland',
                forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
                iconUrl: 'http://icon.ak.wxug.com/i/c/k/cloudy.gif',
                weather: 'Overcast',
                temp: '54.0 F (12.3 C)'
            },
            {
                name: 'Bend',
                forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
                iconUrl: 'http://icon.ak.wxug.com/i/c/k/Partlycloudy.gif',
                weather: 'Partly Cloudy',
                temp: '55.0 F (12.8 C)'
            },
            {
                name: 'Manzanita',
                forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
                iconUrl: 'http://icon.ak.wxug.com/i/c/k/rain.gif',
                weather: 'Light Rian',
                temp: '55.0 F (12.8 C)'
            }
        ]
    }
}
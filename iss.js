const request = require('request');

const fetchMyIP = function(callback) {
  request(`https://api.ipify.org?format=json`, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    const ip = JSON.parse(body).ip;
    callback(null, ip);
  });

};


const fetchCoordsByIP = function(ip, callback) {
  request(`https://ipvigilante.com/${ip}`, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;

    }

    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching Coordinates for IP: ${body}`;
      callback(Error(msg), null);
      return;
    }
    const latitude = JSON.parse(body).data.latitude;
    const longitude = JSON.parse(body).data.longitude;
    let coord = {latitude, longitude};
    callback(null, coord);
  });
};

const fetchISSFlyOverTimes = function(coord, callback) {
  request(`http://api.open-notify.org/iss-pass.json?lat=${coord.latitude}&lon=${coord.longitude}`, (error, response, body) => {

    if (error) {
      callback(error, null);
      return;

    }

    if (response.statusCode !== 200) {
      // const msg = `Status Code ${response.statusCode} when fetching ISS pass times: ${body}`;
      // callback(Error(msg), null);
      // return;
      callback(Error(`Status Code ${response.statusCode} when fetching ISS pass times: ${body}`), null);
      return;
    }

    const passes = JSON.parse(body).response;
    callback(null, passes);
  });
};

const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((err, ip) => {
    if (err) {
      return callback(err, null);
    }
  
    fetchCoordsByIP(ip, (err, loc) => {
      if (err) {
        return callback(err, null);
      }

      fetchISSFlyOverTimes(loc,(err, nextPasses) => {
        if (err) {
          return callback(err, null);
        }
        callback(null, nextPasses);
      });
    });
  });
};


module.exports = { nextISSTimesForMyLocation };
/* 
 * This class attempts to provide a wrapper for the kue module and expose a
 * smaller subset of the api in a more resque like way.
 *
 * Ideally this will make it easier for me to swap out modules if I find a better one;
 * I'd still have to alter this wrapper though so who knows.
 * 
 * @param {port} Integer The port of which the admin GUI for kue listens
 * @param {redisConfigs} Object Port and host of the redis instance we want to connect to
 * @param {debug} Boolean Turns debug mode on or off
 *
**/

var kue = require("kue"),
    redis = require("redis");

function Queue(port, namespaces, redisConfigs, debug) {
  this.port = port;
  this.redisConfigs = redisConfigs || null;

  // Alias of the kue module
  this.q = kue;
  this.debug = debug || false;

  // List of all namespaces
  this.namespaces = namespaces;

  this.setUp();
}

Queue.prototype = {

  createRedisClient: function() {
    return this.q.redis.createClient(this.redisConfigs.port, this.redisConfigs.host);
  },

  setUp: function() {

    if (this.redisConfigs && typeof this.redisConfigs === "object") {

      /* Sets up the redis client on the specified port, otherwise,
       * kue will attempt to connect to a redis instance at the default port and host.
      **/

      this.createRedisClient();
    }
    
    // Initialize the kue GUI
    this.q.app.listen(this.port);

    if (this.debug) {
      console.log("Kue GUI app listening on port %d", this.port);
    }

    this.createQueue();
  },

  // Create a kue Job Queue and return our instance of the kue wrapper.
  createQueue: function() {
    this.jobQueue = this.q.createQueue();

    return this;
  },

  /*
   * Register a new job with redis
   *
   * @param {name} String The type of job to register
   * @param {options} Optional hash of metadata describing the job
   * @param {done} Function callback to be executed after the save method is called
  **/
  enqueue: function(name, options, done) {
    done = typeof done === "function" && done || function() {};

    // Create an instance of the job
    var job = this.jobQueue.create(name, options)

    if (this.debug) {
      console.log("--------Job created------");
      console.log(job.type);
      console.log(job.data);
    }

    // Persist the job to redis
    job.save(function() {
      done(job);
    });
  },

  process: function(types) {
  },

  remove: function(id) {
    if (this.debug) {
      console.log("Removing job with id of %d.", id);
    }
     
    this.q.Job.get(id, function(err, job) {
      if (this.debug) console.log('Job found.');

      if (err) {
        return console.log(err);
      }

      job.remove(function(err) {
        if (err) {
          throw err;
        }

        if (this.debug) {
          console.log("Removed completed job number %d", id);
        }
      });
    });;
  }
};

module.exports = Queue;


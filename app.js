const Hapi = require('hapi');
const Vision = require('vision');
const Handlebars = require('handlebars');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/hapidb')
  .then(() => console.log('MongoDB connected...'))
  .catch((err) => consol.error(err));

// create mongoose model
const Task = mongoose.model('Task', {
  text: String
});


const server = Hapi.Server({
  port: 3000,
  host: 'localhost'
});

server.route({
  method: 'GET',
  path: '/',
  handler: (request, h) => {
    return Task.find()
      .exec()
      .then((tasks) => {
        return h.view('index', {
          title: 'Hapi Crashcourse: version ' + request.server.version,
          message: 'Hello Handlebars!',
          tasks: tasks
        })
      });
    // return h.view('index', {
    //   title: 'Hapi Crashcourse: version ' + request.server.version,
    //   message: 'Hello Handlebars!',
    //   tasks: [
    //     { text: 'Task one '},
    //     { text: 'Task two '},
    //     { text: 'Task three '},
    //   ]
    // });
    // return '<h1>Hello World!</h1>';
  }
});

server.route({
  method: 'POST',
  path: '/',
  handler: async (request, h) => {
    let text = request.payload.text;
    let newTask = new Task({
      text
    });
    return newTask
      .save()
      .then(() => {
        return h.redirect('/');
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

server.route({
  method: 'GET',
  path: '/user/{name}',
  handler: (request, h) => {
    // // request.log is HAPI standard way of logging
    // request.log(['a','name'], "Request name");
    // // you can also use a pino instance, which will be faster
    // request.logger.info(`In handler ${request.path}`);
    return `Hello ${encodeURIComponent(request.params.name)}!`;
  }
});

const init = async () => {
  await server.register(require('inert'));

  // await server.register({
  //   plugin: require('hapi-pino'),
  //   options: {
  //     prettyPrint: true,
  //     logEvents:['response']
  //   }
  // });

  await server.register(Vision);
  server.views({
    engines: {
      html: Handlebars
    },
    relativeTo: __dirname,
    path: `${__dirname}/views`
  });

  server.route({
    method: 'GET',
    path: '/about',
    handler: (request, h) => {
      return h.file('./public/about.html');
    }
  });
  server.route({
    method: 'GET',
    path: '/image',
    handler: (request, h) => {
      return h.file('./public/hapi.png');
    }
  });

  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
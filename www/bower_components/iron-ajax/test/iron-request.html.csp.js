suite('<iron-request>', function () {
      var jsonResponseHeaders;
      var successfulRequestOptions;
      var request;
      var server;

      setup(function () {
        jsonResponseHeaders = {
          'Content-Type': 'application/json'
        };
        server = sinon.fakeServer.create();
        server.respondWith('GET', '/responds_to_get_with_json', [
          200,
          jsonResponseHeaders,
          '{"success":true}'
        ]);

        server.respondWith('GET', '/responds_to_get_with_prefixed_json', [
          200,
          jsonResponseHeaders,
          '])}while(1);</x>{"success":true}'
        ]);

        server.respondWith('GET', '/responds_to_get_with_500', [
          500,
          {},
          ''
        ]);

        server.respondWith('GET', '/responds_to_get_with_100', [
          100,
          {},
          ''
        ]);

        server.respondWith('GET', '/responds_to_get_with_0', [
          0,
          jsonResponseHeaders,
          '{"success":true}'
        ]);


        request = fixture('TrivialRequest');
        successfulRequestOptions = {
          url: '/responds_to_get_with_json'
        };

        synchronousSuccessfulRequestOptions = {
          url: '/responds_to_get_with_json',
          async: false,
          timeout: 100
        };

        asynchronousSuccessfulRequestOptions = {
          url: '/responds_to_get_with_json',
          async: true,
          timeout: 100
        };
      });

      teardown(function () {
        server.restore();
      });

      suite('basic usage', function () {
        test('creates network requests, requiring only `url`', function () {
          request.send(successfulRequestOptions);

          server.respond();

          expect(request.response).to.be.ok;
        });

        test('timeout not set if synchronous', function () {
          request.send(synchronousSuccessfulRequestOptions);

          expect(request.xhr.async).to.be.eql(false);
          expect(request.xhr.timeout).to.be.eql(undefined);
        });

        test('timeout set if asynchronous', function () {
          request.send(asynchronousSuccessfulRequestOptions);

          expect(request.xhr.async).to.be.eql(true);
          expect(request.xhr.timeout).to.be.eql(100);
        });

        test('sets async to true by default', function () {
          request.send(successfulRequestOptions);
          expect(request.xhr.async).to.be.eql(true);
        });

        test('can be aborted', function () {
          request.send(successfulRequestOptions);

          request.abort();

          server.respond();

          return request.completes.then(function () {
            throw new Error('Request did not abort appropriately!');
          }).catch(function (e) {
            expect(request.response).to.not.be.ok;
          });
        });

        test('default responseType is text', function () {
          request.send(successfulRequestOptions);
          server.respond();

          return request.completes.then(function() {
            expect(request.response).to.be.an('string')
          });
        });

        test('default responseType of text is not applied, when async is false', function () {
          var options = Object.create(successfulRequestOptions);
          options.async = false;

          request.send(options);
          server.respond();

          return request.completes.then(function() {
            expect(request.xhr.responseType).to.be.empty;
          });
        });

        test('responseType can be configured via handleAs option', function () {
          var options = Object.create(successfulRequestOptions);
          options.handleAs = 'json';

          request.send(options);
          expect(server.requests.length).to.be.equal(1);
          expect(server.requests[0].requestHeaders['accept']).to.be.equal(
              'application/json');
          server.respond();

          return request.completes.then(function() {
            expect(request.response).to.be.an('object');
          });
        });

        test('setting jsonPrefix correctly strips it from the response', function () {
          var options = {
            url: '/responds_to_get_with_prefixed_json',
            handleAs: 'json',
            jsonPrefix: '])}while(1);</x>'
          };

          request.send(options);
          expect(server.requests.length).to.be.equal(1);
          expect(server.requests[0].requestHeaders['accept']).to.be.equal(
              'application/json');
          server.respond();

          return request.completes.then(function() {
            expect(request.response).to.deep.eq({success: true});
          });
        });

        test('responseType cannot be configured via handleAs option, when async is false', function () {
          var options = Object.create(successfulRequestOptions);
          options.handleAs = 'json';
          options.async = false;

          request.send(options);
          expect(server.requests.length).to.be.equal(1);
          expect(server.requests[0].requestHeaders['accept']).to.be.equal(
              'application/json');
          server.respond();

          return request.completes.then(function() {
            expect(request.response).to.be.a('string');
          });
        });

        test('headers are sent up', function() {
          var options = Object.create(successfulRequestOptions);
          options.headers = {
            'foo': 'bar',
            'accept': 'this should override the default'
          };
          request.send(options);
          expect(server.requests.length).to.be.equal(1);
          var fakeXhr = server.requests[0]
          expect(fakeXhr.requestHeaders['foo']).to.be.equal(
              'bar');
          expect(fakeXhr.requestHeaders['accept']).to.be.equal(
              'this should override the default');
        });

        test('headers are deduped by lowercasing', function() {
          var options = Object.create(successfulRequestOptions);
          options.headers = {
            'foo': 'bar',
            'Foo': 'bar',
            'fOo': 'bar',
            'Accept': 'this should also override the default'
          };
          request.send(options);
          expect(server.requests.length).to.be.equal(1);
          var fakeXhr = server.requests[0]
          expect(Object.keys(fakeXhr.requestHeaders).length).to.be.equal(2);
          expect(fakeXhr.requestHeaders['foo']).to.be.equal(
              'bar');
          expect(fakeXhr.requestHeaders['accept']).to.be.equal(
              'this should also override the default');
        });
      });

      suite('special cases', function() {
        test('treats status code 0 as success, though the outcome is ambiguous', function() {
          // Note: file:// status code will probably be 0 no matter what happened.
          request.send({
            url: '/responds_to_get_with_0'
          });

          server.respond();

          expect(request.succeeded).to.be.equal(true);
        });
      });

      suite('errors', function() {
        test('treats status codes between 1 and 199 as errors', function() {
          request.send({
            url: '/responds_to_get_with_100'
          });

          server.respond();

          expect(request.succeeded).to.be.equal(false);
        });

        test('treats status codes between 300 and ∞ as errors', function() {
          request.send({
            url: '/responds_to_get_with_500'
          });

          server.respond();

          expect(request.succeeded).to.be.equal(false);
        });
      });

      suite('status codes', function() {
        test('status and statusText is set after a ambiguous request', function() {
          request.send({
            url: '/responds_to_get_with_0'
          });

          server.respond();

          expect(request.status).to.be.equal(0);
          expect(request.statusText).to.be.equal('');
        });

        test('status and statusText is set after a request that succeeded', function() {
          request.send({
            url: '/responds_to_get_with_json'
          });

          server.respond();

          expect(request.status).to.be.equal(200);
          expect(request.statusText).to.be.equal('OK');
        });

        test('status and statusText is set after a request that failed', function() {
          request.send({
            url: '/responds_to_get_with_500'
          });

          server.respond();

          expect(request.status).to.be.equal(500);
          expect(request.statusText).to.be.equal('Internal Server Error');
        });
      });
    });
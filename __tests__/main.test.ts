import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import * as core from '@actions/core';
import * as main from '../src/main';
import * as service from '../src/service';
import q from 'q';
import http from 'http';

describe('Test basic destroy environment action', () => {
  const envId = 29;
  const systemResponse_SUCCESS = {"systems": [{"id": 10, "name": "fake-system"}]};
  const environmentResponse_SUCCESS = {"environments": [ {"id": envId, "name": "fake-environment", "systemId": 10 }]}
  const deleteReponse_SUCCESS =  {"id": envId, "name": "fake-environment", "systemId": 10 }

  test('test basic deploy environment', () => {
    jest.spyOn(core, 'getInput').mockImplementation((val) => {
      if (val === 'ctpUrl') {
        return 'https://fake-ctp-endpoint:8080/em/'
      } else if (val === 'ctpUsername' || val === 'ctpPassword') {
        return 'secret';
      } else if (val === 'systemName') {
        return 'fake-system'
      } else if (val === 'environmentName') {
        return 'fake-environment'
      }
    });
    jest.spyOn(service.WebService.prototype, 'findInEM').mockImplementation((path, property, name) => {
        let def = q.defer();
        let promise = new Promise((resolve, reject) => {
            def.resolve = resolve;
            def.reject = reject;
        });
        console.log('findInEM invoked');
        let res = new http.IncomingMessage(null);
        res.statusCode = 200;
        if (path === '/api/v2/systems') {
          def.resolve(systemResponse_SUCCESS);
        }
        else if (path === '/api/v2/environments') {
          def.resolve(environmentResponse_SUCCESS);
        }
        return promise;
    });
    jest.spyOn(service.WebService.prototype, 'deleteFromEM').mockImplementation((path) => {
        let def = q.defer();
        let promise = new Promise((resolve, reject) => {
            def.resolve = resolve;
            def.reject = reject;
        });
        console.log('deleteFromEM invoked');
        let res = new http.IncomingMessage(null);
        res.statusCode = 200;
        if (path === '/api/v2/environments/' + envId + '?recursive=true') {
          def.resolve(deleteReponse_SUCCESS);
        }
        return promise;
    });
    main.run();
  });
  
//    test('test runs', () => {
//      process.env['INPUT_CTPURL'] = 'http://104.42.225.105/em'
//      process.env['INPUT_CTPUSERNAME'] = 'admin'
//      process.env['INPUT_CTPPASSWORD'] = 'admin'
//      process.env['INPUT_SYSTEM'] = 'ParaBank'
//      process.env['INPUT_ENVIRONMENT'] = 'TestDestroy'
//      const np = process.execPath
//      const ip = path.join(__dirname, '..', 'lib', 'main.js')
//      const options: cp.ExecFileSyncOptions = {
//      env: process.env
//      }
//      console.log(cp.execFileSync(np, [ip], options).toString())
//    });
});
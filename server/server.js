import Server from 'express-emitter';
import bodyParser from 'body-parser';
import InvoiceReportCtrl from './controllers/InvoiceReportCtrl';
const path = require('path');



export default class RestServer extends Server {
  constructor() {
    super((app) => {
      // normally routes would be set up cleaner but this is a challenge,
      // not a commercial app. just bear with it.
      app
        .set('port', 3005)
        .use(
          bodyParser.urlencoded({
            extended: true,
          }),
          bodyParser.json(),
          bodyParser.text()
        )
        .get('/', (req, res) => {
          res.sendFile(
            path.resolve('bundle/index.html')
          );
        })
        .get('/bundle.js', (req, res) => {
          res.sendFile(
            path.resolve('bundle/bundle.js')
          )
        })
        .get('/invoice-report', async (req, res) => {
          await InvoiceReportCtrl.get(req, res);
        })

    })
  }
}

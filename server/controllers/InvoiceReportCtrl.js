import Creator from '../services/InvoiceReport/Create';

class InvoiceReportCtrl {
  async get(req: Object, res: Object) {
    try {
      const creator = new Creator();
      await creator.create();
      res.status(200).json();
    } catch (e) {
      res.status(400).json();
    }
  }
}

export default new InvoiceReportCtrl();

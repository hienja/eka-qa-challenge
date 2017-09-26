import names from './names.js';

export default class ExtractPDF {
	constructor(content) {
		let listOfText = content.items.map(function(value) {
			return value.str;
		});
		this.header = this.getHeader(listOfText);
		this.columnNames = this.getColumnNames(listOfText);
		this.shipperInfo = this.getShipperInfo(listOfText, this.columnNames);
	}

	getHeader(list) {
		let header = {};
		let condition = true;

		while (condition) {
			if (list[0].includes(names.testPDF.RUN_DATE)) {
				header.runDate = list[0].split(' ')[2];
			} else if (list[0].includes(names.testPDF.title)) {
				header.title = list[0];
			} else if (list[0].includes(names.testPDF.lastHeaderWords)) {
				header.invoiceDate = list[0].split(' ')[2];
				condition = false;
			} else {
				header.brokerName = list[0];
			}
			list.shift();
		}

		return header;
	}

	getColumnNames(list) {
		let columnNameList = [];
		let condition = true;
		while (condition) {
			columnNameList.push(list[0]);
			if (list[0].includes(names.testPDF.lastColumnName)) {
				condition = false;
			}
			list.shift();
		}

		return columnNameList;
	}

	getShipperInfo(list, columnNames) {
		let shipperList = [];
		while (list.length > 0) {
			let countLoadNumber = 0;

			for (let i = 1; Number.isInteger(Number(list[i])); i++) {
				countLoadNumber++;
			}
			shipperList.push({});
			let shipperInfo = shipperList[shipperList.length - 1];
			shipperInfo[columnNames[0]] = list[0];
			list.shift();
			shipperInfo[names.testPDF.LOADS] = [];
			for (let k = 1; k < columnNames.length; k++) {
				let columnName = columnNames[k];
				let count = 0;

				while (count < countLoadNumber) {
					if (k === 1) {
						shipperInfo[names.testPDF.LOADS].push({});
						shipperInfo[names.testPDF.LOADS][count][names.testPDF.SHIPPER_NAME] =
							shipperInfo[names.testPDF.SHIPPER_NAME];
					}
					shipperInfo[names.testPDF.LOADS][count][columnName] = list[0];
					list.shift();
					count++;
				}
			}
			shipperInfo[names.testPDF.INVOICE_AMOUNT] = list[0];
			list.shift();
		}

		return shipperList;
	}
}

/*
{
	header: {
		runDate: string,
		brokerName: string,
		title: string,
		invoiceDate: string,

	},
	columnNames: ["Shipper Name", ....],
	shipperInfo: [
		{
			"Shipper Name": string,
			"Loads": [
				{
					"EKA Load Nbr": string,
					"Shipper Load Nbr": string,
					"Load Origin": string,
					"Load Destination": string,
					...
				},
				...
			]
			"Invoice Amount": string
		},
		...
	]
}
*/

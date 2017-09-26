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
		const lastHeaderWords = 'Invoice Date';
		const runDate = 'Run Date';
		const title = 'Daily Invoice Report';
		let condition = true;

		while (condition) {
			if (list[0].includes(runDate)) {
				header.runDate = list[0].split(' ')[2];
			} else if (list[0].includes(title)) {
				header.title = list[0];
			} else if (list[0].includes(lastHeaderWords)) {
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
		const lastColumnName = 'Invoice Amount';
		let condition = true;
		while (condition) {
			columnNameList.push(list[0]);
			if (list[0].includes(lastColumnName)) {
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
			shipperInfo['Loads'] = [];
			for (let k = 1; k < columnNames.length; k++) {
				let columnName = columnNames[k];
				let count = 0;

				while (count < countLoadNumber) {
					if (k === 1) {
						shipperInfo['Loads'].push({});
					}
					shipperInfo['Loads'][count][columnName] = list[0];
					list.shift();
					count++;
				}
			}
			shipperInfo['Invoice Amount'] = list[0];
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

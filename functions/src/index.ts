const serviceAccount = require("../firebase.json");
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const Excel = require("exceljs");
const moment = require("moment");
require("moment-timezone");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://campus-density.firebaseio.com",
});

const db = admin.firestore();
const gymDB = "gyms";
const round30 = true;
moment.tz.setDefault("America/New_York");

exports.getURL = functions.https.onCall(
  (data: { id: string; startDate: string; endDate: string }) => {
    if (!data.id || !data.startDate || !data.endDate) {
      throw new functions.https.HttpsError("invalid-argument", "ID missing!");
    }
    const id = data.id;
    const startDate = data.startDate;
    const endDate = data.endDate;
    return getData(id, startDate, endDate);
  }
);

async function getData(gymName: string, startStr: string, endStr: string) {
  const startDate = moment(startStr);
  const endDate = moment(endStr);
  endDate.endOf("day");

  // retrieve data
  const gymCounts = db
    .collection(gymDB)
    .doc(gymName)
    .collection("counts")
    .where("time", ">=", startDate.toDate())
    .where("time", "<=", endDate.toDate());
  const allGymDocs = await gymCounts.get();
  const docs = allGymDocs.docs;

  // dates
  const dates = generateDates(startDate, endDate); // list of dates from startDate to endDate

  // times
  const separateDates: any[] = []; // 2d list of data, separated by date
  let [beginTime, endTime] = cycleDateData(docs, separateDates, dates);
  const times = generateTimes(beginTime, endTime); // 15min interval

  // populate data
  const cardioGranularSheet: any[] = [];
  const weightsGranularSheet: any[] = [];
  const cardioTotalSheet: any[] = [];
  const weightsTotalSheet: any[] = [];
  for (const time of times) {
    addRow(separateDates, dates, time, [
      cardioGranularSheet,
      weightsGranularSheet,
      cardioTotalSheet,
      weightsTotalSheet,
    ]);
  }

  // add column header
  const dateHeader = dates.map((d) => d.format("ddd M/D/YY"));
  cardioGranularSheet.unshift([""].concat(dateHeader));
  weightsGranularSheet.unshift([""].concat(dateHeader));
  cardioTotalSheet.unshift([""].concat(dateHeader));
  weightsTotalSheet.unshift([""].concat(dateHeader));

  // write to spreadsheet
  const wb = new Excel.Workbook();
  wb.created = wb.modified = moment();
  addWS(wb, "Cardio", "3fd2f3", cardioGranularSheet);
  addWS(wb, "Weights", "b3ebfb", weightsGranularSheet);
  addWS(wb, "Cardio Total", "3fd2f3", cardioTotalSheet);
  addWS(wb, "Weights Total", "b3ebfb", weightsTotalSheet);

  // add to storage
  const storage = admin.storage();
  const bucket = storage.bucket("campus-density-gym");
  const fileName = `${gymName}_${startDate.format(
    "YYYY-MM-DD"
  )}_${endDate.format("YYYY-MM-DD")}.xlsx`;
  const buffer = await wb.xlsx.writeBuffer();
  await bucket.file(fileName).save(buffer);
  return fileName;
}

function roundTime(t: number) {
  const date = moment.utc(moment.duration(t, "minutes").as("milliseconds"));
  const roundedDate = roundDate(date);
  return roundedDate.hour() * 60 + roundedDate.minute();
}

function roundDate(d: Date) {
  const date = moment(d);
  date.millisecond(Math.floor(date.millisecond() / 1000) * 1000);
  date.second(Math.floor(date.second() / 60) * 60);
  if (round30) {
    date.minute(Math.round((date.minute() + 15) / 30) * 30 - 15);
  } else {
    date.minute(Math.round(date.minute() / 15) * 15);
  }
  return date;
}

function cycleDateData(docs: any, separateDates: any[], dates: any) {
  let beginTime = 24 * 60;
  let endTime = 0;
  for (const d of dates) {
    const dateData = docs.filter((doc: any) => {
      const t = moment(doc.get("time").toDate());
      return d.isSame(t, "day");
    });
    let data = [];
    if (dateData.length !== 0) {
      const timeData = dateData.map((doc: any) =>
        moment(doc.get("time").toDate())
      );
      const earliest = moment.min(timeData);
      const earliestTime = earliest.hour() * 60 + earliest.minute();
      beginTime = Math.min(beginTime, earliestTime);
      const latest = moment.max(timeData);
      const latestTime = latest.hour() * 60 + latest.minute();
      endTime = Math.max(endTime, latestTime);
      data = dateData;
    }
    separateDates.push(data);
  }
  return [beginTime, endTime];
}

function generateDates(startDate: any, endDate: any) {
  const dates = [];
  const currDate = startDate.clone();
  while (currDate.diff(endDate) < 0) {
    dates.push(currDate.clone());
    currDate.add(1, "days");
  }
  return dates;
}

function generateTimes(begin: any, end: any) {
  const times = [];
  const currentTime = moment.duration(roundTime(begin), "minutes");
  let endTime = moment.duration(roundTime(end), "minutes");
  while (currentTime <= endTime) {
    times.push(currentTime.clone());
    currentTime.add(round30 ? 30 : 15, "minutes");
  }
  return times;
}

function addCell(separateDate: any, time: any, rows: string[][]) {
  const dateData = separateDate.filter((doc: any) => {
    const t = moment(doc.get("time").toDate());
    const roundedTime = roundDate(t);
    const timeInMinutes = roundedTime.hour() * 60 + roundedTime.minute();
    const timeDuration = moment.duration(timeInMinutes, "minutes");
    return time.as("minutes") === timeDuration.as("minutes");
  });

  let cardioGranularData = "";
  let weightsGranularData = "";
  let cardioTotalData = "";
  let weightsTotalData = "";
  if (dateData.length !== 0) {
    const doc = dateData[dateData.length - 1]; // latest data entry
    const cardioDoc = doc.get("cardio");
    const treadmills = cardioDoc.treadmills;
    const ellipticals = cardioDoc.ellipticals;
    const bikes = cardioDoc.bikes;
    const amts = cardioDoc.amts;
    const cardioGranularCell =
      "Treadmills: " +
      treadmills +
      " \nEllipticals: " +
      ellipticals +
      " \nBikes: " +
      bikes +
      " \nAMTs: " +
      amts;
    const cardioTotalCell = treadmills + ellipticals + bikes + amts;
    cardioGranularData = cardioGranularCell;
    cardioTotalData = cardioTotalCell;

    const weightsDoc = doc.get("weights");
    const powerRacks = weightsDoc.powerRacks;
    const benchPress = weightsDoc.benchPress;
    const dumbbells = weightsDoc.dumbbells;
    const other = weightsDoc.other;
    const weightsGranularCell =
      "Power Racks: " +
      powerRacks +
      " \nBench Press: " +
      benchPress +
      " \nDumbbells: " +
      dumbbells +
      " \nOther: " +
      other;
    const weightsTotalCell = powerRacks + benchPress + dumbbells + other;
    weightsGranularData = weightsGranularCell;
    weightsTotalData = weightsTotalCell;
  }
  rows[0].push(cardioGranularData);
  rows[1].push(weightsGranularData);
  rows[2].push(cardioTotalData);
  rows[3].push(weightsTotalData);
}

function addRow(separateDates: any, dates: any, time: any, sheets: any[][]) {
  const hm = dates[0].clone().add(time);
  const timeHeader = hm.format("h:mm A");

  const cardioGranularRow = [timeHeader];
  const weightsGranularRow = [timeHeader];
  const cardioTotalRow = [timeHeader];
  const weightsTotalRow = [timeHeader];
  for (const separateDate of separateDates) {
    addCell(separateDate, time, [
      cardioGranularRow,
      weightsGranularRow,
      cardioTotalRow,
      weightsTotalRow,
    ]);
  }
  sheets[0].push(cardioGranularRow);
  sheets[1].push(weightsGranularRow);
  sheets[2].push(cardioTotalRow);
  sheets[3].push(weightsTotalRow);
}

function addWS(workbook: any, name: string, color: string, rows: string[][]) {
  workbook.addWorksheet(name, {
    properties: { tabColor: { argb: color } },
    views: [{ state: "frozen", xSplit: 1, ySplit: 1 }],
  });
  const worksheet = workbook.getWorksheet(name);
  worksheet.addRows(rows);
  worksheet.getRow("1").alignment = {
    vertical: "middle",
    horizontal: "center",
  };
  worksheet.getColumn("A").alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  // fit cells to height and width
  const colsWithData = new Set();
  worksheet.eachRow((row: any) => {
    let maxHeight = 0;
    row.eachCell((cell: any, colNum: number) => {
      const value = cell.value;
      if (value.toString().indexOf("\n") !== -1) {
        cell.alignment = { wrapText: true };
        maxHeight = 57.6;
        colsWithData.add(colNum);
      }
    });
    row.height = Math.max(maxHeight, 14.4);
  });
  for (let i = 0; i < worksheet.columns.length; i++) {
    const colNum = i + 1;
    const col = worksheet.getColumn(colNum);
    if (colsWithData.has(colNum)) {
      col.width = 13.5;
    } else {
      col.width = 10.5;
    }
  }
}

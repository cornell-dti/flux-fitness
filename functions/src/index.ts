const serviceAccount = require("../firebase.json");
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const XLSX = require("xlsx");
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
  const dates = []; // list of dates from startDate to endDate
  while (startDate.diff(endDate) < 0) {
    dates.push(startDate.clone());
    startDate.add(1, "days");
  }

  // times
  let beginTime = 24 * 60;
  let endTime = 0;
  const separateDates = []; // 2d list of data, separated by date
  for (const d of dates) {
    const dateData = docs.filter((doc: any) => {
      const t = moment(doc.get("time").toDate());
      return d.isSame(t, "day");
    });
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
      separateDates.push(dateData);
    } else {
      separateDates.push([]);
    }
  }

  // list of times (in intervals of 15min) from the earliest to latest for the entire time frame
  const times = [];
  const currentTime = moment.duration(roundTime(beginTime), "minutes");
  endTime = moment.duration(roundTime(endTime), "minutes");
  while (currentTime <= endTime) {
    times.push(currentTime.clone());
    currentTime.add(round30 ? 30 : 15, "minutes");
  }

  // populate data
  const cardioGranularSheet = [];
  const weightsGranularSheet = [];
  const cardioTotalSheet = [];
  const weightsTotalSheet = [];

  for (const time of times) {
    const hm = dates[0].clone().add(time);
    const timeHeader = hm.format("h:mm A");

    const cardioGranularRow = [timeHeader];
    const weightsGranularRow = [timeHeader];
    const cardioTotalRow = [timeHeader];
    const weightsTotalRow = [timeHeader];
    for (const separateDate of separateDates) {
      const dateData = separateDate.filter((doc: any) => {
        const t = moment(doc.get("time").toDate());
        const roundedTime = roundDate(t);
        const timeInMinutes = roundedTime.hour() * 60 + roundedTime.minute();
        const timeDuration = moment.duration(timeInMinutes, "minutes");
        return time.as("minutes") === timeDuration.as("minutes");
      });
      if (dateData.length !== 0) {
        const doc = dateData[dateData.length - 1]; // latest data entry
        const cardioDoc = doc.get("cardio");
        const treadmills = cardioDoc.treadmills;
        const ellipticals = cardioDoc.ellipticals;
        const bikes = cardioDoc.bikes;
        const amts = cardioDoc.amts;
        const cardioGranularCell = // TODO change to newlines
          "Treadmills: " +
          treadmills +
          " // Ellipticals: " +
          ellipticals +
          " // Bikes: " +
          bikes +
          " // AMTs: " +
          amts;
        const cardioTotalCell = treadmills + ellipticals + bikes + amts;
        const weightsDoc = doc.get("weights");
        const powerRacks = weightsDoc.powerRacks;
        const benchPress = weightsDoc.benchPress;
        const dumbbells = weightsDoc.dumbbells;
        const other = weightsDoc.other;
        const weightsGranularCell = // TODO change to newlines
          "Power Racks: " +
          powerRacks +
          " // Bench Press: " +
          benchPress +
          " // Dumbbells: " +
          dumbbells +
          " // Other: " +
          other;
        const weightsTotalCell = powerRacks + benchPress + dumbbells + other;
        cardioGranularRow.push(cardioGranularCell);
        weightsGranularRow.push(weightsGranularCell);
        cardioTotalRow.push(cardioTotalCell);
        weightsTotalRow.push(weightsTotalCell);
      } else {
        cardioGranularRow.push("");
        weightsGranularRow.push("");
        cardioTotalRow.push("");
        weightsTotalRow.push("");
      }
    }
    cardioGranularSheet.push(cardioGranularRow);
    weightsGranularSheet.push(weightsGranularRow);
    cardioTotalSheet.push(cardioTotalRow);
    weightsTotalSheet.push(weightsTotalRow);
  }

  // write to spreadsheet
  const dateHeader = dates.map((d) => d.format("ddd M/D/YY"));
  const wb = XLSX.utils.book_new();

  cardioGranularSheet.unshift([""].concat(dateHeader));
  wb.SheetNames.push("Cardio");
  const cardioGranularWS = XLSX.utils.aoa_to_sheet(cardioGranularSheet);
  wb.Sheets["Cardio"] = cardioGranularWS;

  weightsGranularSheet.unshift([""].concat(dateHeader));
  wb.SheetNames.push("Weights");
  const weightsGranularWS = XLSX.utils.aoa_to_sheet(weightsGranularSheet);
  wb.Sheets["Weights"] = weightsGranularWS;

  cardioTotalSheet.unshift([""].concat(dateHeader));
  wb.SheetNames.push("Cardio Total");
  const cardioTotalWS = XLSX.utils.aoa_to_sheet(cardioTotalSheet);
  wb.Sheets["Cardio Total"] = cardioTotalWS;

  weightsTotalSheet.unshift([""].concat(dateHeader));
  wb.SheetNames.push("Weights Total");
  const weightsTotalWS = XLSX.utils.aoa_to_sheet(weightsTotalSheet);
  wb.Sheets["Weights Total"] = weightsTotalWS;

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
  const storage = admin.storage();
  const bucket = storage.bucket("campus-density-gym");
  const fileName = `${gymName}_${startDate.format(
    "YYYY-MM-DD"
  )}_${endDate.format("YYYY-MM-DD")}.xlsx`;
  const file = bucket.file(fileName);
  await file.save(buffer);
  return `/campus-density-gym/${fileName}`;
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

const serviceAccount = require('../firebase.json');
const admin = require('firebase-admin');
const XLSX = require('xlsx');
const functions = require('firebase-functions');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://campus-density.firebaseio.com"
});

const db = admin.firestore();
const round30 = true;

exports.getURL = functions.https.onCall((data: { id: string, startDate: string, endDate: string, offset: number }) => {
    if (!data.id || !data.startDate || !data.endDate || !data.offset) {
        throw new functions.https.HttpsError('invalid-argument', 'ID missing!');
    }
    const id = data.id;
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const offset = data.offset;
    return getData(id, startDate, endDate, offset);
});

async function getData(gymName: string, startDate: Date, endDate: Date, offset: number) {
    endDate.setDate(endDate.getDate() + 1);

    // retrieve data
    const gymCounts = db.collection('gyms').doc(gymName).collection('counts').where('time', '>=', startDate).where('time', '<', endDate);
    const allGymDocs = await gymCounts.get();
    const docs = allGymDocs.docs;
    const wb = XLSX.utils.book_new();

    // dates
    const dates = []; // list of Date objects from startDate to endDate
    for (const i = new Date(startDate); i < endDate; i.setTime(i.getTime() + 24 * 60 * 60 * 1000)) {
        dates.push(new Date(i)); // UTC
    }
    const dateHeader = dates.map(d => d.toLocaleString("en-US", { // local time string
        weekday: 'short',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'UTC'
    }));

    // times
    let begin = 24 * 60;
    let end = 0;
    const separateDates = []; // 2d list of data, separated by date
    for (const d of dates) {
        const fullDateData = docs.filter((doc: any) => {
            const recordedDate = new Date(doc.get('time').toDate().getTime()); // UTC
            const referenceDate = new Date(d)
            recordedDate.setHours(0, 0, 0, 0);
            referenceDate.setHours(24, 0, 0, 0);
            return referenceDate.getTime() === recordedDate.getTime();
        })
        if (fullDateData.length !== 0) { // record earliest and latest times
            for (const timeData of fullDateData) {
                let time = timeData.get('time').toDate();
                time = round30 ? roundTime30(time) : roundTime(time); // UTC
                const timeInMinutes = time.getHours() * 60 + time.getMinutes();
                if (timeInMinutes + offset < begin) {
                    begin = timeInMinutes;
                }
                else if (timeInMinutes + offset > end) {
                    end = timeInMinutes;
                }
            }
            separateDates.push(fullDateData);
        }
        else {
            separateDates.push([]);
        }
    }

    // list of times (in intervals of 15min) from the earliest to latest for the entire time frame
    const times = [];
    for (let time = begin; time <= end; time += round30 ? 30 : 15) {
        times.push(time);
    }

    // populate data
    const cardioSheet = [];
    const weightsSheet = [];
    for (const time of times) {
        const hmDate = new Date(dates[0].getTime() + time * 60000);
        const cardioRow = [hmDate.toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
            timeZone: 'UTC'
        })];
        const weightsRow = [hmDate.toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
            timeZone: 'UTC'
        })];
        for (const dateData of separateDates) {
            const timeData = dateData.filter((doc: any) => {
                const recordedTime = doc.get('time').toDate(); // UTC
                const roundedTime = round30 ? roundTime30(recordedTime) : roundTime(recordedTime); // UTC
                const timeInMinutes = roundedTime.getHours() * 60 + roundedTime.getMinutes();
                return time === timeInMinutes;
            })
            if (timeData.length !== 0) {
                const doc = timeData[timeData.length - 1]; // latest data entry
                cardioRow.push(doc.get('cardio'));
                weightsRow.push(doc.get('weights'));
            }
            else {
                cardioRow.push('');
                weightsRow.push('');
            }
        }
        cardioSheet.push(cardioRow);
        weightsSheet.push(weightsRow);
    }

    // write to spreadsheet
    cardioSheet.unshift([''].concat(dateHeader));
    wb.SheetNames.push("Cardio");
    const cardioWS = XLSX.utils.aoa_to_sheet(cardioSheet);
    wb.Sheets["Cardio"] = cardioWS;

    weightsSheet.unshift([''].concat(dateHeader));
    wb.SheetNames.push("Weights");
    const weightsWS = XLSX.utils.aoa_to_sheet(weightsSheet);
    wb.Sheets["Weights"] = weightsWS;

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    const storage = admin.storage();
    const bucket = storage.bucket('campus-density-gym');
    endDate.setDate(endDate.getDate() - 1);
    const fileName = `${gymName}_${startDate.toISOString().split("T")[0]}_${endDate.toISOString().split("T")[0]}.xlsx`
    const file = bucket.file(fileName);
    await file.save(buffer);
    return `/campus-density-gym/${fileName}`;
};

function roundTime(date: Date) {
    const time = date;
    time.setMilliseconds(Math.round(time.getMilliseconds() / 1000) * 1000);
    time.setSeconds(Math.round(time.getSeconds() / 60) * 60);
    time.setMinutes(Math.round(time.getMinutes() / 15) * 15);
    return time;
}

function roundTime30(date: Date) {
    const time = date;
    time.setMilliseconds(Math.round(time.getMilliseconds() / 1000) * 1000);
    time.setSeconds(Math.round(time.getSeconds() / 60) * 60);
    time.setMinutes(Math.round((time.getMinutes() + 15) / 30) * 30 - 15);
    return time;
}

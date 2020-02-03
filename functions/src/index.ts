const serviceAccount = require('../firebase.json');
const admin = require('firebase-admin');
const XLSX = require('xlsx');
const functions = require('firebase-functions');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://campus-density.firebaseio.com"
});

const db = admin.firestore();
const gyms = ['teagle', 'helen_newman', 'noyes', 'appel'];

exports.getURL = functions.https.onCall((data: { id: string, startDate: string, endDate: string }) => {
    if (!data.id || !data.startDate || !data.endDate) {
        throw new functions.https.HttpsError('invalid-argument', 'ID missing!');
    }
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const id = data.id;
    return getData(id, startDate, endDate);
});

async function getData(gymName: string, startDate: Date, endDate: Date) {
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    endDate.setDate(endDate.getDate() + 1);
    const gymCounts = db.collection('gymdata').doc(gymName).collection('counts').where('time', '>=', startDate).where('time', '<', endDate);
    const allGymDocs = await gymCounts.get();
    const docs = allGymDocs.docs;
    const wb = XLSX.utils.book_new();
    const dates = []; // list of Date objects from startDate to endDate
    for (const i = startDate; i < endDate; i.setDate(i.getDate() + 1)) {
        dates.push(i);
    }
    const dateHeader = dates.map(d => d.toLocaleString("en-US", {
        weekday: 'short',
        month: '2-digit',
        day: '2-digit',
        timeZone: "America/New_York"
    }));
    let [beginHour, beginMin] = [0, 0]
    let [endHour, endMin] = [0, 0];
    const separateDates = []; // list of lists of data, separated by date
    for (const d of dates) {
        const refDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const refTime = refDate.getTime();
        const fullDateData = docs.filter((doc: any) => {
            const recordedDate = doc.get('time').toDate();
            recordedDate.setHours(0, 0, 0, 0);
            refTime == recordedDate.getTime();
        })
        if (fullDateData.length != 0) {
            const earliestTime = new Date(fullDateData[0].get('time').toDate());
            const earliestHour = earliestTime.getHours();
            const earliestMin = earliestTime.getMinutes();
            [beginHour, beginMin] = earliestHour > beginHour ? [beginHour, beginMin] :
                earliestMin > beginMin ? [earliestHour, beginMin] : [earliestHour, earliestMin];
            const latestTime = new Date(fullDateData[fullDateData.length - 1].get('time').toDate());
            const latestHour = latestTime.getHours();
            const latestMin = latestTime.getMinutes();
            [endHour, endMin] = latestHour > endHour ? [endHour, endMin] :
                latestMin > endMin ? [latestHour, endMin] : [latestHour, latestMin];
        }
        separateDates.push(fullDateData);
    }

    const times = []; // list of times (in intervals of 15min) from the earliest to latest in a given day
    for (let [h, m] = [beginHour, beginMin]; h <= endHour && m <= endMin; () => { m += 15; if (m >= 60) { h++; m = 0; } }) {
        times.push([h, m]);
    }

    const cardioSheet = [];
    for (const [h, m] of times) {
        const hmDate = new Date();
        hmDate.setHours(h, m);
        const row = [hmDate.toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
            timeZone: "America/New_York"
        })];
        for (const dateData of separateDates) {
            const timeData = dateData.filter((doc: any) => {
                const recordedDate = doc.get('time').toDate();
                const recordedHour = recordedDate.getHours();
                const recordedMin = recordedDate.getMinutes();
                [h, m] == [recordedHour, recordedMin];
            })
            if (timeData != []) {
                row.push(timeData[0].get('cardio'));
            }
            else {
                row.push('');
            }
        }
        cardioSheet.push(row);
    }
    cardioSheet.unshift([''].concat(dateHeader));
    wb.SheetNames.push("Cardio");
    const cardioWS = XLSX.utils.aoa_to_sheet(cardioSheet);
    wb.Sheets["Cardio"] = cardioWS;

    const weightsSheet = [];
    for (const [h, m] of times) {
        const hmDate = new Date();
        hmDate.setHours(h, m);
        const row = [hmDate.toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
            timeZone: "America/New_York"
        })];
        for (const dateData of separateDates) {
            const timeData = dateData.filter((doc: any) => {
                const recordedDate = doc.get('time').toDate();
                const recordedHour = recordedDate.getHours();
                const recordedMin = recordedDate.getMinutes();
                [h, m] == [recordedHour, recordedMin];
            })
            if (timeData != []) {
                row.push(timeData[0].get('weights'));
            }
            else {
                row.push('');
            }
        }
        weightsSheet.push(row);
    }
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

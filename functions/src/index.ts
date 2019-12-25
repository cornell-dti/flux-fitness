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
    endDate.setDate(endDate.getDate() + 1);
    const id = data.id;
    return getData(id, startDate, endDate);
});

async function getData(gymName: string, startDate: Date, endDate: Date) {
    const gymCounts = db.collection('gymdata').doc(gymName).collection('counts').where('time', '>=', startDate).where('time', '<=', endDate);
    const allGymDocs = await gymCounts.get();
    const wb = XLSX.utils.book_new();

    const cardioSheet = allGymDocs.docs.map((doc: any) => [new Date(doc.get('time').seconds * 1000).toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        timeZone: "America/New_York"
    }), doc.get('cardio')]);
    cardioSheet.unshift(['Time', 'Count']);
    wb.SheetNames.push("Cardio");
    const cardioWS = XLSX.utils.aoa_to_sheet(cardioSheet);
    wb.Sheets["Cardio"] = cardioWS;

    const weightsSheet = allGymDocs.docs.map((doc: any) => [new Date(doc.get('time').seconds * 1000).toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        timeZone: "America/New_York"
    }), doc.get('weights')]);
    weightsSheet.unshift(['Time', 'Count']);
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

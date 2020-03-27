const { doc, creds } = require('./db')

module.exports = async (req, res) => {
  await doc.useServiceAccountAuth(creds)
  await doc.loadInfo()
  const sheet = doc.sheetsByIndex[0]

  const rawRows = await sheet.getRows()
  // console.log(rows)

  let rows = []

  for (let rawRow of rawRows) {
    if (!rawRow['Date Announced']) {
      break
    }

    // Turn M/F to word
    function processGender(letter) {
      if (rawRow['Gender'] === 'M') return 'male'
      else return 'female'
    }

    // Remove empty strings ("")
    function processSources(sources) {
      return sources.filter(source => source)
    }

    const row = {
      patientId: parseInt(rawRow['MemberName']), // Change in frontend, used to be 'P' + rawRow['Patient Number']
      reportedOn: rawRow['DateJoined'],
      onsetEstimate: '',
      ageEstimate: rawRow['Age'],
      gender: processGender(rawRow['Gender']), // Change in frontend, used to be 'M'/'F'
      city: rawRow['City'],
      state: rawRow['Chapter'],
      district: rawRow['Dist'],
      status: rawRow['CurrentStatus'],
      notes: rawRow['Notes'],
      contractedFrom: rawRow['Sponsor'],
      sources: processSources([
        rawRow['Source_1'],
        rawRow['Source_2'],
        rawRow['Source_3'],
      ]),
    }

    rows.push(row)
  }

  let resp = {
    success: true,
    data: {
      source: 'docs.google.com/spreadsheets/d/101EGxxKVpK-UoczxrOqhwlhngdoCA3UgDHjqaC1-x0E/edit?usp=sharing',
      lastRefreshed: new Date(),
      summary: {
        total: rows.length,
      },
      rawPatientData: rows,
    },
    lastRefreshed: new Date(),
    lastOriginUpdate: new Date(),
  }

  res.json(resp)
}

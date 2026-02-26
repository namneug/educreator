// ============================================================
// EduCreator AI — Google Apps Script (รหัส.gs)
// Ethics Checklist API v3
// รองรับ: Ethics + Submissions + Grading + validateStudent + submitEssay
// ============================================================
// GitHub: https://namneug.github.io/educreator/
// Google Sheets: https://docs.google.com/spreadsheets/d/1ASybann36oSCUkFOLutOi-DkCl95rm-8NYLNcbn6pkM/
// ============================================================

function doPost(e) {
  try {
    var ss   = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);
    var formType = data.formType || 'ethics';

    // ── 1. ส่งงาน (Submission) ─────────────────────────────
    if (formType === 'submission') {
      var sheet = ss.getSheetByName('Submissions');
      if (!sheet) { sheet = ss.insertSheet('Submissions'); }
      sheet.appendRow([
        data.timestamp, data.studentName, data.topicChosen,
        data.chTiktok, data.chYoutube, data.chInstagram, data.chSpotify, data.chOther,
        data.linkV1, data.linkV2, data.linkV3, data.linkPod, data.linkMicro,
        data.linkI1, data.linkI2, data.linkI3, data.contentCount,
        data.totalViews, data.totalLikes, data.totalComments,
        data.totalShares, data.newFollowers, data.avgWatchTime, data.analyticsInsight
      ]);
      return ContentService
        .createTextOutput(JSON.stringify({status:'success'}))
        .setMimeType(ContentService.MimeType.JSON);

    // ── 2. ตัดเกรด (Grading) ──────────────────────────────
    } else if (formType === 'grading') {
      var sheet = ss.getSheetByName('Grades');
      if (!sheet) { sheet = ss.insertSheet('Grades'); }
      sheet.appendRow([
        data.timestamp, data.studentName,
        data.gradeContent, data.gradeAI, data.gradeAnalytics,
        data.gradeReport, data.gradeShowcase, data.gradeTotal, data.comment
      ]);
      return ContentService
        .createTextOutput(JSON.stringify({status:'success'}))
        .setMimeType(ContentService.MimeType.JSON);

    // ── 3. คำตอบอัตนัยหนังสือเรียน (Essay) ───────────────
    } else if (formType === 'essay') {
      var sheet = ss.getSheetByName('Essays');
      if (!sheet) {
        sheet = ss.insertSheet('Essays');
        sheet.appendRow(['Timestamp','Name','StudentID','Chapter','Answer1','Answer2']);
      }
      sheet.appendRow([
        new Date(),
        data.name,
        data.studentId,
        data.chapter,
        data.answer1 || '',
        data.answer2 || ''
      ]);
      return ContentService
        .createTextOutput(JSON.stringify({success:true}))
        .setMimeType(ContentService.MimeType.JSON);

    // ── 4. Ethics Checklist (default) ─────────────────────
    } else {
      var sheet = ss.getActiveSheet();
      sheet.appendRow([
        data.timestamp, data.studentName, data.contentPiece,
        data.contentLink, data.aiTools, data.checkedCount,
        data.totalItems, data.checkedItems, data.mainPrompt,
        data.personalTouch, data.concerns, data.passStatus
      ]);
      return ContentService
        .createTextOutput(JSON.stringify({status:'success'}))
        .setMimeType(ContentService.MimeType.JSON);
    }

  } catch(error) {
    return ContentService
      .createTextOutput(JSON.stringify({status:'error', message:error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── 5. ดึงข้อมูลนักศึกษา (getSubmissions) ─────────────────
function doGet(e) {
  try {
    var ss   = SpreadsheetApp.getActiveSpreadsheet();
    var data = e.parameter;

    if (data.action === 'getSubmissions') {
      var sheet = ss.getSheetByName('Submissions');
      if (!sheet) return ContentService
        .createTextOutput(JSON.stringify({status:'success', data:[], count:0}))
        .setMimeType(ContentService.MimeType.JSON);
      var rows = [];
      var values = sheet.getDataRange().getValues();
      for (var i = 1; i < values.length; i++) {
        if (values[i][1]) {
          rows.push({
            timestamp:      values[i][0],
            studentName:    values[i][1],
            topicChosen:    values[i][2],
            gradeContent:   values[i][3],
            gradeAI:        values[i][4],
            gradeAnalytics: values[i][5],
            gradeReport:    values[i][6],
            gradeShowcase:  values[i][7],
            gradeTotal:     values[i][8],
            comment:        values[i][9]
          });
        }
      }
      return ContentService
        .createTextOutput(JSON.stringify({status:'success', data:rows, count:rows.length}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
      .createTextOutput(JSON.stringify({status:'error', message:'Unknown action'}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(error) {
    return ContentService
      .createTextOutput(JSON.stringify({status:'error', message:error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── 6. Validate รหัสนักศึกษา ──────────────────────────────
// (ส่วนนี้อยู่ใน doPost — วางใน if-else block ก่อน return Unknown action)
//
// if(data.action==='validateStudent'){
//   const ss=SpreadsheetApp.getActiveSpreadsheet();
//   const sh=ss.getSheetByName('Students');
//   if(!sh) return ContentService
//     .createTextOutput(JSON.stringify({valid:false,msg:'ไม่พบ Sheet Students'}))
//     .setMimeType(ContentService.MimeType.JSON);
//   const lastRow=sh.getLastRow();
//   if(lastRow<5) return ContentService
//     .createTextOutput(JSON.stringify({valid:false,msg:'ไม่มีข้อมูลนักศึกษา'}))
//     .setMimeType(ContentService.MimeType.JSON);
//   const ids=sh.getRange(5,1,lastRow-4,1).getValues()
//     .flat().map(v=>v.toString().trim());
//   const found=ids.includes(data.studentId.toString().trim());
//   return ContentService
//     .createTextOutput(JSON.stringify({valid:found}))
//     .setMimeType(ContentService.MimeType.JSON);
// }

// ============================================================
// Sheet Structure:
// - Sheet หลัก    : Ethics Checklist submissions
// - Submissions   : งานส่งนักศึกษา (30 วัน)
// - Grades        : คะแนน (อาจารย์ให้)
// - Essays        : คำตอบอัตนัยจากหนังสือเรียน
// - Students      : รายชื่อนักศึกษา 56 คน (col A: studentId, row 5+)
// ============================================================

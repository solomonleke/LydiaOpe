# Google Apps Script Setup & Data-Safe Sheet Initializer

This script is **data-safe**:
- It detects existing guest data (like Adeleke Moyinoluwa's blessing on row 1).
- It removes the burgundy color from their data row, resets it to clean black text on white background.
- It inserts a proper header row above the data (`sheet.insertRowBefore(1)`).
- It creates the new **`Memories`** tab with all 10 column titles.
- It leaves all existing entries untouched and safe!

---

## 🚀 How to Fix and Initialize Your Sheets (30 Seconds)

### Step 1: Open Apps Script
1. In your Google Sheet, click **Extensions** > **Apps Script**.

### Step 2: Paste the Code
1. Replace all code in `Code.gs` with the **Complete Script** below.
2. Click **Save** (diskette icon) or press `Ctrl + S`.

### Step 3: Run `setupWeddingSheets`
1. Select **`setupWeddingSheets`** from the function dropdown at the top.
2. Click **▶ Run**.
3. Return to your Google Sheet:
   - In **Blessings**: Adeleke Moyinoluwa's row is restored to normal, and a clean **`Timestamp | Guest Name | Relationship | Message | Likes`** header row is inserted at the top.
   - In **RSVP** & **Poll_Votes**: Data is preserved and proper headers are in place.
   - In **Memories**: The new tab is created with all 10 column headers for photo & video uploads!

### Step 4: Redeploy Web App
1. Click **Deploy** > **Manage deployments** > **Edit (pencil icon)**.
2. Select **Version** > **New version**.
3. Ensure **Who has access** is **Anyone**, then click **Deploy**.

---

## 📜 Complete Data-Safe Script (`Code.gs`)

```javascript
/**
 * ═════════════════════════════════════════════════════════════════════════
 *  LYDIA & OPE WEDDING BACKEND (Google Sheets + Google Drive)
 *  RSVP | Blessings | Poll_Votes | Memories Vault (Photos & Short Videos)
 * ═════════════════════════════════════════════════════════════════════════
 */

// Name of Google Drive folder where guest photos & short videos are stored
var DRIVE_FOLDER_NAME = "Lydia & Ope Wedding Vault Uploads";

/**
 * ─────────────────────────────────────────────────────────────────────────
 * 1. DATA-SAFE INITIALIZER: RUN THIS FUNCTION IN APPS SCRIPT
 *    Restores existing data rows and safely inserts clean column headers!
 * ─────────────────────────────────────────────────────────────────────────
 */
function setupWeddingSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Blessings Tab (Digital Guestbook)
  fixSheetHeaders(ss, 'Blessings', [
    'Timestamp',
    'Guest Name',
    'Relationship',
    'Message',
    'Likes'
  ]);

  // 2. RSVP Tab
  fixSheetHeaders(ss, 'RSVP', [
    'Timestamp',
    'Full Name',
    'Email',
    'Phone Number',
    'Attending',
    'Guest Count',
    'Dietary Notes',
    'Personal Message'
  ]);

  // 3. Poll_Votes Tab (Pre-wedding Marathon)
  fixSheetHeaders(ss, 'Poll_Votes', [
    'Timestamp',
    'Option',
    'IP Address',
    'User Agent'
  ]);

  // 4. Memories Tab (Guest photos and video uploads)
  fixSheetHeaders(ss, 'Memories', [
    'Timestamp',
    'Guest Name',
    'Relationship',
    'Category',
    'Media Type',
    'File Name',
    'Direct Media URL',
    'Drive File ID',
    'Caption / Note',
    'Likes'
  ]);

  // 5. Ensure Google Drive Uploads Folder is created
  var folder = getOrCreateFolder(DRIVE_FOLDER_NAME);
  Logger.log('✅ Google Drive folder ready: ' + folder.getName() + ' (' + folder.getUrl() + ')');

  // 6. Notify user in the Google Sheet
  try {
    ss.toast('✅ Existing data restored and clean headers inserted across all sheets!', 'Setup Fixed Successfully', 6);
  } catch (e) {}

  Logger.log('🎉 Setup successfully completed! All sheet tabs and headers are configured.');
}

/**
 * Custom menu in Google Sheets toolbar
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('💍 Wedding Admin')
    .addItem('Initialize / Fix Sheets & Columns', 'setupWeddingSheets')
    .addToUi();
}

/**
 * Data-Safe Header Fixer:
 * If row 1 is guest data, removes burgundy background, inserts a new row 1 above it,
 * and sets the column titles.
 */
function fixSheetHeaders(spreadsheet, sheetName, expectedHeaders) {
  var sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.appendRow(expectedHeaders);
    formatHeaderRow(sheet, expectedHeaders.length);
    return;
  }

  var lastRow = sheet.getLastRow();
  if (lastRow === 0) {
    sheet.appendRow(expectedHeaders);
    formatHeaderRow(sheet, expectedHeaders.length);
    return;
  }

  // Inspect Row 1 Cell A1
  var firstCell = sheet.getRange(1, 1).getValue();
  var firstCellStr = (firstCell !== null && firstCell !== undefined) ? firstCell.toString().trim().toLowerCase() : '';

  // If first cell is NOT the literal word 'timestamp', it is actual guest data!
  if (firstCellStr !== 'timestamp') {
    var maxCols = Math.max(sheet.getLastColumn(), expectedHeaders.length);

    // 1. Restore guest data row back to normal styling (remove burgundy background & white text)
    sheet.getRange(1, 1, 1, maxCols)
      .setBackground(null)
      .setFontColor(null)
      .setFontWeight('normal')
      .setHorizontalAlignment('left');

    // 2. Insert new row 1 above the data
    sheet.insertRowBefore(1);
    sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
  } else {
    // Row 1 is already a header; ensure titles match
    sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
  }

  // Apply Burgundy styling strictly to Row 1
  formatHeaderRow(sheet, expectedHeaders.length);
}

/**
 * Formats Row 1 as Royal Burgundy Header with white bold text
 */
function formatHeaderRow(sheet, numCols) {
  var headerRange = sheet.getRange(1, 1, 1, numCols);
  headerRange
    .setFontWeight('bold')
    .setFontColor('#FFFFFF')
    .setBackground('#6B0D25')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  sheet.setRowHeight(1, 34);
  sheet.setFrozenRows(1);

  for (var col = 1; col <= numCols; col++) {
    sheet.autoResizeColumn(col);
  }
}

/**
 * ─────────────────────────────────────────────────────────────────────────
 * 2. POST REQUEST HANDLER: SAVES SUBMISSIONS TO GOOGLE SHEETS & DRIVE
 * ─────────────────────────────────────────────────────────────────────────
 */
function doPost(e) {
  try {
    var contents = e.postData.contents;
    var data = JSON.parse(contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var type = data.type;

    // ── A. WEDDING MEMORY VAULT (Photo & Short Video Upload) ──
    if (type === 'wedding_memory' || type === 'media_upload') {
      var memHeaders = [
        'Timestamp',
        'Guest Name',
        'Relationship',
        'Category',
        'Media Type',
        'File Name',
        'Direct Media URL',
        'Drive File ID',
        'Caption / Note',
        'Likes'
      ];
      var sheet = getOrCreateSheet(ss, 'Memories', memHeaders);

      var mediaUrl = data.url || '';
      var fileId = '';
      var fileName = data.fileName || ('upload_' + new Date().getTime());
      var fileType = data.fileType || (data.mediaType === 'video' ? 'video/mp4' : 'image/jpeg');

      // Save media file directly to Google Drive
      if (data.base64Data) {
        var folder = getOrCreateFolder(DRIVE_FOLDER_NAME);
        var pureBase64 = data.base64Data.replace(/^data:[^;]+;base64,/, '');
        var decodedBytes = Utilities.base64Decode(pureBase64);
        var blob = Utilities.newBlob(decodedBytes, fileType, fileName);

        var driveFile = folder.createFile(blob);
        driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        fileId = driveFile.getId();

        // Direct CDN image/video embed URLs
        if (data.mediaType === 'video' || fileType.indexOf('video') !== -1) {
          mediaUrl = 'https://drive.google.com/uc?export=download&id=' + fileId;
        } else {
          mediaUrl = 'https://lh3.googleusercontent.com/d/' + fileId;
        }
      }

      var submittedAt = data.submittedAt || new Date().toISOString();
      var author = data.author || 'Wedding Guest';
      var relationship = data.relationship || 'Guest';
      var category = data.category || 'reception';
      var mediaType = (data.mediaType || (fileType.indexOf('video') !== -1 ? 'video' : 'image')).toLowerCase();
      var caption = data.caption || '';
      var likes = 1;

      // Append row to 'Memories' sheet
      sheet.appendRow([
        submittedAt,
        author,
        relationship,
        category,
        mediaType.toUpperCase(),
        fileName,
        mediaUrl,
        fileId,
        caption,
        likes
      ]);

      var createdItem = {
        id: 'gs-' + (fileId || new Date().getTime()),
        author: author,
        relationship: relationship,
        category: category,
        mediaType: mediaType,
        url: mediaUrl,
        fileName: fileName,
        caption: caption,
        date: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'd MMM yyyy'),
        timestamp: submittedAt,
        likes: likes
      };

      return respondJson({ status: 'success', item: createdItem, url: mediaUrl });
    }

    // ── B. RSVP SUBMISSION ──
    if (type === 'rsvp') {
      var rsvpSheet = getOrCreateSheet(ss, 'RSVP', [
        'Timestamp', 'Full Name', 'Email', 'Phone Number',
        'Attending', 'Guest Count', 'Dietary Notes', 'Personal Message'
      ]);

      rsvpSheet.appendRow([
        new Date().toISOString(),
        data.fullName || '',
        data.email || '',
        data.phone || '',
        data.attending || '',
        data.guestCount || 1,
        data.dietaryNotes || '',
        data.message || ''
      ]);

      return respondJson({ status: 'success' });
    }

    // ── C. BLESSINGS / DIGITAL GUESTBOOK ──
    if (type === 'blessing') {
      var blessingSheet = getOrCreateSheet(ss, 'Blessings', [
        'Timestamp', 'Guest Name', 'Relationship', 'Message', 'Likes'
      ]);

      blessingSheet.appendRow([
        new Date().toISOString(),
        data.author || '',
        data.relationship || 'Guest',
        data.message || '',
        1
      ]);

      return respondJson({ status: 'success' });
    }

    // ── D. POLL VOTES ──
    if (type === 'poll_vote') {
      var pollSheet = ss.getSheetByName('Poll_Votes') ||
                      ss.getSheetByName('MarathonPoll') ||
                      getOrCreateSheet(ss, 'Poll_Votes', ['Timestamp', 'Option', 'IP Address', 'User Agent']);

      pollSheet.appendRow([
        data.submittedAt || new Date().toISOString(),
        data.option || '',
        data.ipAddress || '',
        data.userAgent || ''
      ]);

      return respondJson({ status: 'success' });
    }

    return respondJson({ status: 'error', message: 'Unknown request type: ' + type });
  } catch (error) {
    return respondJson({ status: 'error', message: error.toString() });
  }
}

/**
 * ─────────────────────────────────────────────────────────────────────────
 * 3. GET REQUEST HANDLER: LOADS MEMORIES, BLESSINGS & POLL RESULTS
 * ─────────────────────────────────────────────────────────────────────────
 */
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // ── A. GET ALL MEMORIES ──
    if (action === 'getMemories') {
      var memSheet = ss.getSheetByName('Memories');
      if (!memSheet) return respondJson({ status: 'success', data: [] });

      var rows = memSheet.getDataRange().getValues();
      var list = [];

      for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        if (!row[0] && !row[6]) continue;

        var rawTime = row[0];
        var parsedDate = rawTime ? new Date(rawTime) : new Date();
        var dateStr = Utilities.formatDate(parsedDate, Session.getScriptTimeZone(), 'd MMM yyyy');

        var driveFileId = row[7] ? row[7].toString().trim() : '';
        list.push({
          id: 'gs-' + i + '-' + (driveFileId || i),
          timestamp: rawTime ? rawTime.toString() : new Date().toISOString(),
          date: dateStr,
          author: row[1] ? row[1].toString() : 'Guest',
          relationship: row[2] ? row[2].toString() : 'Guest',
          category: row[3] ? row[3].toString().toLowerCase() : 'reception',
          mediaType: row[4] ? row[4].toString().toLowerCase() : 'image',
          fileName: row[5] ? row[5].toString() : '',
          url: row[6] ? row[6].toString() : '',
          driveId: driveFileId,
          thumbnailUrl: driveFileId ? ('https://lh3.googleusercontent.com/d/' + driveFileId) : '',
          caption: row[8] ? row[8].toString() : '',
          likes: parseInt(row[9], 10) || 1
        });
      }

      list.reverse();
      return respondJson({ status: 'success', data: list });
    }

    // ── B. GET BLESSINGS ──
    if (action === 'getBlessings') {
      var bSheet = ss.getSheetByName('Blessings');
      if (!bSheet) return respondJson({ status: 'success', data: [] });

      var bRows = bSheet.getDataRange().getValues();
      var bList = [];

      for (var j = 1; j < bRows.length; j++) {
        var bRow = bRows[j];
        if (!bRow[1] && !bRow[3]) continue;
        bList.push({
          id: 'b-' + j,
          author: bRow[1].toString(),
          relationship: bRow[2] ? bRow[2].toString() : 'Guest',
          message: bRow[3] ? bRow[3].toString() : '',
          date: Utilities.formatDate(new Date(bRow[0]), Session.getScriptTimeZone(), 'd MMM yyyy'),
          likes: parseInt(bRow[4], 10) || 1
        });
      }

      bList.reverse();
      return respondJson({ status: 'success', data: bList });
    }

    // ── C. GET POLL RESULTS ──
    if (action === 'getPollResults') {
      var pSheet = ss.getSheetByName('Poll_Votes') || ss.getSheetByName('MarathonPoll');
      if (!pSheet) return respondJson({ status: 'success', participate: 0, unavailable: 0 });

      var pRows = pSheet.getDataRange().getValues();
      var part = 0;
      var unavail = 0;

      for (var k = 1; k < pRows.length; k++) {
        var opt = (pRows[k][1] || '').toString().toLowerCase();
        if (opt === 'participate') part++;
        else if (opt === 'unavailable') unavail++;
      }

      return respondJson({ status: 'success', participate: part, unavailable: unavail });
    }

    return respondJson({ status: 'success', message: 'Lydia & Ope Wedding API is online' });
  } catch (error) {
    return respondJson({ status: 'error', message: error.toString() });
  }
}

/**
 * ─────────────────────────────────────────────────────────────────────────
 * 4. UTILITY HELPERS
 * ─────────────────────────────────────────────────────────────────────────
 */
function getOrCreateSheet(spreadsheet, sheetName, headers) {
  var sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.appendRow(headers);
    formatHeaderRow(sheet, headers.length);
  }
  return sheet;
}

function getOrCreateFolder(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
}

function respondJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

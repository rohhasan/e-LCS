// Template Google Apps Script untuk dipasang di Spreadsheet Anda
export const APPS_SCRIPT_TEMPLATE = `/**
 * ============================================================
 * E-LCS BPP KARANGWARENG - BACKEND GOOGLE APPS SCRIPT
 * SPREADSHEET DATABASE CONNECTOR (SMART AUTO-DETECTION)
 * ============================================================
 */

const SPREADSHEET_ID = "1QBtiYXfv21kYnFkDa_z1vxpQrezBx_leZCDifPqV0KI";

function getSpreadsheet() {
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (e) {
    return SpreadsheetApp.getActiveSpreadsheet();
  }
}

/**
 * Mencari sheet berdasarkan daftar kemungkinan nama (case-insensitive & spasi fleksibel)
 */
function findSheetFlexible(possibleNames, defaultName) {
  const ss = getSpreadsheet();
  const sheets = ss.getSheets();
  
  if (sheets.length === 0) {
    return ss.insertSheet(defaultName);
  }

  for (let i = 0; i < possibleNames.length; i++) {
    const target = possibleNames[i].toLowerCase().replace(/[^a-z0-9]/g, "");
    for (let j = 0; j < sheets.length; j++) {
      const sheetName = sheets[j].getName().toLowerCase().replace(/[^a-z0-9]/g, "");
      if (sheetName === target) {
        return sheets[j];
      }
    }
  }

  // Jika hanya ada 1 sheet (misal Sheet1) dan user belum buat tab lain
  if (sheets.length === 1 && possibleNames.includes("Tugas_Aksi")) {
    return sheets[0];
  }

  // Jika belum ada, buat sheet baru
  return ss.insertSheet(defaultName);
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "getAll";
  let result = { status: "error", message: "Invalid action" };

  try {
    if (action === "ping") {
      result = { status: "success", message: "Server E-LCS Terhubung & Aktif!" };
    } else if (action === "getAll") {
      result = {
        status: "success",
        data: {
          aksi: apiGetDaftarAksi().data || [],
          rekap: apiGetRekapData("", "admin").data || [],
          users: apiGetUsers().data || [],
          settings: apiGetPengaturanSistem().data || {}
        }
      };
    } else if (action === "getRekap") {
      result = apiGetRekapData(e.parameter.nip, e.parameter.role);
    } else if (action === "getAksi") {
      result = apiGetDaftarAksi();
    } else if (action === "getSettings") {
      result = apiGetPengaturanSistem();
    } else if (action === "getUsers") {
      result = apiGetUsers();
    }
  } catch (err) {
    result = { status: "error", message: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let result = { status: "error", message: "No post data received" };
  try {
    let postData = {};
    if (e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
      } catch (err) {
        postData = e.parameter || {};
      }
    } else if (e.parameter) {
      postData = e.parameter;
    }

    const action = postData.action;

    if (action === "submitLaporan") {
      result = apiSubmitLaporan(postData.payload || postData);
    } else if (action === "addAksi") {
      result = apiAddDaftarAksi(postData.data || postData);
    } else if (action === "deleteAksi") {
      result = apiDeleteDaftarAksi(postData.id);
    } else if (action === "saveSettings") {
      result = apiSavePengaturanSistem(postData.data || postData);
    } else if (action === "saveUser") {
      result = apiSaveUser(postData.user || postData);
    } else if (action === "login") {
      result = apiLogin(postData.nip, postData.password);
    }
  } catch (err) {
    result = { status: "error", message: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ----------------------------------------------------
// 1. TUGAS AKSI (SMART COLUMN DETECTOR)
// ----------------------------------------------------
function apiGetDaftarAksi() {
  const sheet = findSheetFlexible(["Tugas_Aksi", "Tugas Aksi", "Tugas", "Daftar Aksi", "Aksi", "Sheet1"], "Tugas_Aksi");
  const data = sheet.getDataRange().getValues();
  if (!data || data.length === 0) return { status: "success", data: [] };

  let startRow = 0;
  let idxId = -1, idxTanggal = -1, idxKategori = -1, idxJudul = -1, idxUrl = -1;

  // Cek apakah baris 0 adalah Header
  const header = data[0];
  const isHeader = header.some(h => typeof h === "string" && /tanggal|date|kategori|judul|title|url|link|berita/i.test(h));

  if (isHeader) {
    startRow = 1;
    for (let c = 0; c < header.length; c++) {
      const h = String(header[c]).toLowerCase();
      if (/^id|no|kode/i.test(h)) idxId = c;
      else if (/tanggal|tgl|date|hari/i.test(h)) idxTanggal = c;
      else if (/kategori|category|platform|media|jenis/i.test(h)) idxKategori = c;
      else if (/judul|title|berita|topik|nama/i.test(h)) idxJudul = c;
      else if (/url|link|tautan|alamat|web/i.test(h)) idxUrl = c;
    }
  }

  // Fallback pemetaan indeks kolom jika tidak ada header
  if (idxTanggal === -1) idxTanggal = header.length >= 4 ? 1 : 0;
  if (idxKategori === -1) idxKategori = header.length >= 4 ? 2 : -1;
  if (idxJudul === -1) idxJudul = header.length >= 4 ? 3 : (header.length === 3 ? 1 : 0);
  if (idxUrl === -1) idxUrl = header.length >= 4 ? 4 : (header.length === 3 ? 2 : 1);

  const list = [];
  const today = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd");

  for (let i = startRow; i < data.length; i++) {
    const row = data[i];
    if (!row || row.every(cell => cell === "" || cell === null)) continue;

    let tgl = idxTanggal >= 0 && row[idxTanggal] ? row[idxTanggal] : today;
    if (tgl instanceof Date) {
      tgl = Utilities.formatDate(tgl, "GMT+7", "yyyy-MM-dd");
    } else {
      tgl = String(tgl).trim();
    }

    const kat = idxKategori >= 0 && row[idxKategori] ? String(row[idxKategori]).trim() : "Berita Artikel";
    const jdl = idxJudul >= 0 && row[idxJudul] ? String(row[idxJudul]).trim() : "";
    const u = idxUrl >= 0 && row[idxUrl] ? String(row[idxUrl]).trim() : "";
    const id = idxId >= 0 && row[idxId] ? String(row[idxId]).trim() : ("AKSI-" + (i + 1));

    if (jdl || u) {
      list.push({
        id: id,
        tanggal: tgl || today,
        kategori: kat || "Berita Artikel",
        judul: jdl || "Tugas Berita LCS",
        url: u || "#"
      });
    }
  }

  return { status: "success", data: list };
}

function apiAddDaftarAksi(d) {
  const sheet = findSheetFlexible(["Tugas_Aksi", "Tugas Aksi", "Tugas", "Daftar Aksi", "Aksi"], "Tugas_Aksi");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["ID Tugas", "Tanggal", "Kategori", "Judul Berita", "URL Berita"]);
  }
  const id = d.id || ("AKSI-" + new Date().getTime());
  sheet.appendRow([id, d.tanggal, d.kategori, d.judul, d.url]);
  return { status: "success", message: "Tugas aksi berhasil ditambahkan ke Spreadsheet!", id: id };
}

function apiDeleteDaftarAksi(id) {
  const sheet = findSheetFlexible(["Tugas_Aksi", "Tugas Aksi", "Tugas", "Daftar Aksi", "Aksi"], "Tugas_Aksi");
  const data = sheet.getDataRange().getValues();
  for (let i = 0; i < data.length; i++) {
    if (String(data[i][0]) === String(id) || String(data[i][3]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { status: "success", message: "Tugas aksi berhasil dihapus!" };
    }
  }
  return { status: "error", message: "Data tugas tidak ditemukan." };
}

// ----------------------------------------------------
// 2. REKAP LAPORAN EVIDEN
// ----------------------------------------------------
function apiGetRekapData(userNip, userRole) {
  const sheet = findSheetFlexible(["Laporan_Eviden", "Laporan Eviden", "Laporan", "Rekap", "Eviden"], "Laporan_Eviden");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [] };

  const list = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0] && !row[2] && !row[4]) continue;

    let tgl = row[2];
    if (tgl instanceof Date) {
      tgl = Utilities.formatDate(tgl, "GMT+7", "yyyy-MM-dd");
    }

    const item = {
      id: String(row[0] || ("LAP-" + i)),
      timestamp: String(row[1] || ""),
      tanggal: String(tgl || ""),
      nip: String(row[3] || ""),
      nama: String(row[4] || ""),
      tempatKerja: String(row[5] || ""),
      judulBerita: String(row[6] || ""),
      urlBerita: String(row[7] || ""),
      fileLike: String(row[8] || ""),
      fileShare: String(row[9] || ""),
      fileKomen1: String(row[10] || ""),
      fileKomen2: String(row[11] || ""),
      fileKomen3: String(row[12] || ""),
      status: String(row[13] || "Disetujui"),
      namaKoordinator: String(row[14] || ""),
      nipKoordinator: String(row[15] || "")
    };

    if (userRole === "admin" || !userNip || item.nip === String(userNip)) {
      list.push(item);
    }
  }
  return { status: "success", data: list };
}

function apiSubmitLaporan(p) {
  const sheet = findSheetFlexible(["Laporan_Eviden", "Laporan Eviden", "Laporan", "Rekap", "Eviden"], "Laporan_Eviden");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "ID Laporan", "Timestamp", "Tanggal", "NIP", "Nama Penyuluh",
      "Tempat Kerja", "Judul Berita", "URL Berita", "Foto Like",
      "Foto Share", "Foto Komen 1", "Foto Komen 2", "Foto Komen 3",
      "Status", "Nama Koordinator", "NIP Koordinator"
    ]);
  }

  const id = p.id || ("LAP-" + new Date().getTime());
  const now = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");
  sheet.appendRow([
    id,
    now,
    p.tanggal,
    p.nip,
    p.nama,
    p.tempatKerja,
    p.judulBerita,
    p.urlBerita,
    p.fileLike || "",
    p.fileShare || "",
    p.fileKomen1 || "",
    p.fileKomen2 || "",
    p.fileKomen3 || "",
    p.status || "Disetujui",
    p.namaKoordinator || "",
    p.nipKoordinator || ""
  ]);

  return { status: "success", message: "Laporan eviden berhasil disimpan ke Spreadsheet!", id: id };
}

// ----------------------------------------------------
// 3. PENGATURAN SISTEM & PENGGUNA
// ----------------------------------------------------
function apiGetPengaturanSistem() {
  const sheet = findSheetFlexible(["Pengaturan_Batas_Jam", "Pengaturan", "Settings"], "Pengaturan_Batas_Jam");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return {
      status: "success",
      data: { statusBatasJam: "tidak", jamBatasMulai: "00:00", jamBatasAkhir: "23:59" }
    };
  }
  return {
    status: "success",
    data: {
      statusBatasJam: String(data[1][0] || "tidak"),
      jamBatasMulai: String(data[1][1] || "00:00"),
      jamBatasAkhir: String(data[1][2] || "23:59")
    }
  };
}

function apiSavePengaturanSistem(d) {
  const sheet = findSheetFlexible(["Pengaturan_Batas_Jam", "Pengaturan", "Settings"], "Pengaturan_Batas_Jam");
  sheet.clearContents();
  sheet.appendRow(["Status Batas Jam", "Jam Batas Mulai", "Jam Batas Akhir", "Terakhir Diperbarui"]);
  sheet.appendRow([d.statusBatasJam, d.jamBatasMulai, d.jamBatasAkhir, new Date().toISOString()]);
  return { status: "success", message: "Pengaturan batas jam berhasil disimpan!" };
}

function apiGetUsers() {
  const sheet = findSheetFlexible(["Pengguna", "User", "Users", "Akun"], "Pengguna");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [] };

  const list = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    list.push({
      nip: String(row[0]),
      password: row[1] ? String(row[1]) : "",
      nama: String(row[2] || ""),
      tempatKerja: String(row[3] || ""),
      role: String(row[4] || "penyuluh"),
      namaKoordinator: String(row[5] || ""),
      nipKoordinator: String(row[6] || "")
    });
  }
  return { status: "success", data: list };
}

function apiSaveUser(u) {
  const sheet = findSheetFlexible(["Pengguna", "User", "Users", "Akun"], "Pengguna");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["NIP", "Password", "Nama", "Tempat Kerja", "Role", "Nama Koordinator", "NIP Koordinator"]);
  }
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(u.nip)) {
      sheet.getRange(i + 1, 1, 1, 7).setValues([[
        u.nip, u.password || "", u.nama, u.tempatKerja, u.role, u.namaKoordinator || "", u.nipKoordinator || ""
      ]]);
      return { status: "success", message: "Profil pengguna diperbarui!" };
    }
  }
  sheet.appendRow([
    u.nip, u.password || "", u.nama, u.tempatKerja, u.role, u.namaKoordinator || "", u.nipKoordinator || ""
  ]);
  return { status: "success", message: "Pengguna baru berhasil ditambahkan!" };
}

function apiLogin(nip, password) {
  const users = apiGetUsers().data || [];
  const found = users.find(u => String(u.nip) === String(nip) && (!password || u.password === String(password)));
  if (found) {
    return { status: "success", user: found };
  }
  return { status: "error", message: "NIP atau Password salah!" };
}
`;

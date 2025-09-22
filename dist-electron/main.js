"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const database_1 = require("./database");
let mainWindow;
let database;
const createWindow = () => {
    // 메인 윈도우 생성
    mainWindow = new electron_1.BrowserWindow({
        width: 1400,
        height: 900,
        title: 'Patient Chart System',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, '../assets/icon.png'), // 아이콘 파일이 있다면
        titleBarStyle: 'default',
        show: false // 준비될 때까지 숨김
    });
    // 개발 모드에서는 Vite 개발 서버, 프로덕션에서는 빌드된 파일
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
    // 윈도우가 준비되면 표시
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
    // 윈도우가 닫힐 때
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
};
// 앱이 준비되면 윈도우 생성
electron_1.app.whenReady().then(async () => {
    // 데이터베이스 초기화
    database = new database_1.Database();
    await database.initialize();
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
// 모든 윈도우가 닫히면 앱 종료 (macOS 제외)
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
// IPC 핸들러들
electron_1.ipcMain.handle('auth:register', async (event, userData) => {
    try {
        const result = await database.registerUser(userData);
        return { success: true, data: result };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});
electron_1.ipcMain.handle('auth:login', async (event, credentials) => {
    try {
        const result = await database.loginUser(credentials);
        return { success: true, data: result };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});
electron_1.ipcMain.handle('auth:verify', async (event, token) => {
    try {
        const result = await database.verifyToken(token);
        return { success: true, data: result };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});
electron_1.ipcMain.handle('patients:getAll', async (event, userId) => {
    try {
        const result = await database.getPatientCharts(userId);
        return { success: true, data: result };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});
electron_1.ipcMain.handle('patients:save', async (event, userId, patientData) => {
    try {
        const result = await database.savePatientChart(userId, patientData);
        return { success: true, data: result };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});
electron_1.ipcMain.handle('patients:delete', async (event, userId, fileNo) => {
    try {
        const result = await database.deletePatientChart(userId, fileNo);
        return { success: true, data: result };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});
electron_1.ipcMain.handle('clinic:getInfo', async (event, userId) => {
    try {
        const result = await database.getClinicInfo(userId);
        return { success: true, data: result };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});
electron_1.ipcMain.handle('clinic:saveInfo', async (event, userId, clinicInfo) => {
    try {
        const result = await database.saveClinicInfo(userId, clinicInfo);
        return { success: true, data: result };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});
electron_1.ipcMain.handle('backup:create', async (event, userId) => {
    try {
        const result = await database.createBackup(userId);
        return { success: true, data: result };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});
electron_1.ipcMain.handle('backup:restore', async (event, backupPath) => {
    try {
        const result = await database.restoreBackup(backupPath);
        return { success: true, data: result };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});
// 파일 다이얼로그
electron_1.ipcMain.handle('dialog:openFile', async () => {
    const result = await electron_1.dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
            { name: 'Database Files', extensions: ['db'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    return result;
});
electron_1.ipcMain.handle('dialog:saveFile', async () => {
    const result = await electron_1.dialog.showSaveDialog(mainWindow, {
        filters: [
            { name: 'Database Files', extensions: ['db'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    return result;
});
//# sourceMappingURL=main.js.map
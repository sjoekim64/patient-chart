"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// API를 렌더러 프로세스에 안전하게 노출
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // 인증 관련
    auth: {
        register: (userData) => electron_1.ipcRenderer.invoke('auth:register', userData),
        login: (credentials) => electron_1.ipcRenderer.invoke('auth:login', credentials),
        verify: (token) => electron_1.ipcRenderer.invoke('auth:verify', token),
    },
    // 환자 데이터 관련
    patients: {
        getAll: (userId) => electron_1.ipcRenderer.invoke('patients:getAll', userId),
        save: (userId, patientData) => electron_1.ipcRenderer.invoke('patients:save', userId, patientData),
        delete: (userId, fileNo) => electron_1.ipcRenderer.invoke('patients:delete', userId, fileNo),
    },
    // 클리닉 정보 관련
    clinic: {
        getInfo: (userId) => electron_1.ipcRenderer.invoke('clinic:getInfo', userId),
        saveInfo: (userId, clinicInfo) => electron_1.ipcRenderer.invoke('clinic:saveInfo', userId, clinicInfo),
    },
    // 백업 관련
    backup: {
        create: (userId) => electron_1.ipcRenderer.invoke('backup:create', userId),
        restore: (backupPath) => electron_1.ipcRenderer.invoke('backup:restore', backupPath),
    },
    // 파일 다이얼로그
    dialog: {
        openFile: () => electron_1.ipcRenderer.invoke('dialog:openFile'),
        saveFile: () => electron_1.ipcRenderer.invoke('dialog:saveFile'),
    },
});
//# sourceMappingURL=preload.js.map
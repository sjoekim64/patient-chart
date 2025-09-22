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
exports.Database = void 0;
const sqlite3 = __importStar(require("sqlite3"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const electron_1 = require("electron");
const JWT_SECRET = 'your-secret-key-change-in-production'; // 프로덕션에서는 환경변수로 관리
class Database {
    db;
    dbPath;
    constructor() {
        // 사용자 데이터 디렉토리에 DB 파일 저장
        const userDataPath = electron_1.app.getPath('userData');
        this.dbPath = path.join(userDataPath, 'patient_charts.db');
        // 디렉토리가 없으면 생성
        if (!fs.existsSync(userDataPath)) {
            fs.mkdirSync(userDataPath, { recursive: true });
        }
    }
    async initialize() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('데이터베이스 연결 실패:', err);
                    reject(err);
                    return;
                }
                console.log('SQLite 데이터베이스 연결 성공:', this.dbPath);
                this.createTables().then(resolve).catch(reject);
            });
        });
    }
    async createTables() {
        const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        clinic_name TEXT,
        therapist_name TEXT,
        therapist_license_no TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
        const createPatientChartsTable = `
      CREATE TABLE IF NOT EXISTS patient_charts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_no TEXT NOT NULL,
        user_id TEXT NOT NULL,
        chart_type TEXT NOT NULL,
        chart_data TEXT NOT NULL,
        date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE(user_id, file_no)
      )
    `;
        const createClinicInfoTable = `
      CREATE TABLE IF NOT EXISTS clinic_info (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT UNIQUE NOT NULL,
        clinic_name TEXT,
        clinic_logo TEXT,
        therapist_name TEXT,
        therapist_license_no TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `;
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run(createUsersTable);
                this.db.run(createPatientChartsTable);
                this.db.run(createClinicInfoTable, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        console.log('데이터베이스 테이블 생성 완료');
                        resolve();
                    }
                });
            });
        });
    }
    // 사용자 등록
    async registerUser(userData) {
        const userId = this.generateId();
        const passwordHash = await bcrypt.hash(userData.password, 10);
        const user = {
            id: userId,
            username: userData.username,
            passwordHash,
            clinicName: userData.clinicName,
            therapistName: userData.therapistName,
            therapistLicenseNo: userData.therapistLicenseNo,
            createdAt: new Date().toISOString(),
        };
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`
        INSERT INTO users (id, username, password_hash, clinic_name, therapist_name, therapist_license_no, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
            stmt.run([
                user.id,
                user.username,
                user.passwordHash,
                user.clinicName,
                user.therapistName,
                user.therapistLicenseNo,
                user.createdAt
            ], function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                // JWT 토큰 생성
                const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
                resolve({ user, token });
            });
            stmt.finalize();
        });
    }
    // 사용자 로그인
    async loginUser(credentials) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM users WHERE username = ?', [credentials.username], async (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (!row) {
                    reject(new Error('사용자를 찾을 수 없습니다.'));
                    return;
                }
                const isValidPassword = await bcrypt.compare(credentials.password, row.password_hash);
                if (!isValidPassword) {
                    reject(new Error('비밀번호가 올바르지 않습니다.'));
                    return;
                }
                const user = {
                    id: row.id,
                    username: row.username,
                    passwordHash: row.password_hash,
                    clinicName: row.clinic_name,
                    therapistName: row.therapist_name,
                    therapistLicenseNo: row.therapist_license_no,
                    createdAt: row.created_at,
                };
                // JWT 토큰 생성
                const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
                resolve({ user, token });
            });
        });
    }
    // 토큰 검증
    async verifyToken(token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            return new Promise((resolve, reject) => {
                this.db.get('SELECT * FROM users WHERE id = ?', [decoded.userId], (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (!row) {
                        reject(new Error('사용자를 찾을 수 없습니다.'));
                        return;
                    }
                    const user = {
                        id: row.id,
                        username: row.username,
                        passwordHash: row.password_hash,
                        clinicName: row.clinic_name,
                        therapistName: row.therapist_name,
                        therapistLicenseNo: row.therapist_license_no,
                        createdAt: row.created_at,
                    };
                    resolve(user);
                });
            });
        }
        catch (error) {
            throw new Error('유효하지 않은 토큰입니다.');
        }
    }
    // 환자 차트 조회
    async getPatientCharts(userId) {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM patient_charts WHERE user_id = ? ORDER BY updated_at DESC', [userId], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                const charts = rows.map(row => ({
                    id: row.id,
                    fileNo: row.file_no,
                    userId: row.user_id,
                    chartType: row.chart_type,
                    chartData: row.chart_data,
                    date: row.date,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at,
                }));
                resolve(charts);
            });
        });
    }
    // 환자 차트 저장
    async savePatientChart(userId, patientData) {
        const chartData = JSON.stringify(patientData);
        const now = new Date().toISOString();
        return new Promise((resolve, reject) => {
            // 기존 차트가 있는지 확인
            this.db.get('SELECT id FROM patient_charts WHERE user_id = ? AND file_no = ?', [userId, patientData.fileNo], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (row) {
                    // 업데이트
                    const stmt = this.db.prepare(`
              UPDATE patient_charts 
              SET chart_data = ?, date = ?, updated_at = ?
              WHERE user_id = ? AND file_no = ?
            `);
                    stmt.run([chartData, patientData.date, now, userId, patientData.fileNo], function (err) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve({
                            id: row.id,
                            fileNo: patientData.fileNo,
                            userId,
                            chartType: patientData.chartType,
                            chartData,
                            date: patientData.date,
                            createdAt: row.created_at,
                            updatedAt: now,
                        });
                    });
                    stmt.finalize();
                }
                else {
                    // 새로 생성
                    const stmt = this.db.prepare(`
              INSERT INTO patient_charts (file_no, user_id, chart_type, chart_data, date, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `);
                    stmt.run([
                        patientData.fileNo,
                        userId,
                        patientData.chartType,
                        chartData,
                        patientData.date,
                        now,
                        now
                    ], function (err) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve({
                            id: this.lastID,
                            fileNo: patientData.fileNo,
                            userId,
                            chartType: patientData.chartType,
                            chartData,
                            date: patientData.date,
                            createdAt: now,
                            updatedAt: now,
                        });
                    });
                    stmt.finalize();
                }
            });
        });
    }
    // 환자 차트 삭제
    async deletePatientChart(userId, fileNo) {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM patient_charts WHERE user_id = ? AND file_no = ?', [userId, fileNo], function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
    // 클리닉 정보 조회
    async getClinicInfo(userId) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM clinic_info WHERE user_id = ?', [userId], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (!row) {
                    resolve(null);
                    return;
                }
                resolve({
                    id: row.id,
                    userId: row.user_id,
                    clinicName: row.clinic_name,
                    clinicLogo: row.clinic_logo,
                    therapistName: row.therapist_name,
                    therapistLicenseNo: row.therapist_license_no,
                    updatedAt: row.updated_at,
                });
            });
        });
    }
    // 클리닉 정보 저장
    async saveClinicInfo(userId, clinicInfo) {
        const now = new Date().toISOString();
        return new Promise((resolve, reject) => {
            // 기존 정보가 있는지 확인
            this.db.get('SELECT id FROM clinic_info WHERE user_id = ?', [userId], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (row) {
                    // 업데이트
                    const stmt = this.db.prepare(`
              UPDATE clinic_info 
              SET clinic_name = ?, clinic_logo = ?, therapist_name = ?, therapist_license_no = ?, updated_at = ?
              WHERE user_id = ?
            `);
                    stmt.run([
                        clinicInfo.clinicName,
                        clinicInfo.clinicLogo,
                        clinicInfo.therapistName,
                        clinicInfo.therapistLicenseNo,
                        now,
                        userId
                    ], function (err) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve({
                            id: row.id,
                            userId,
                            clinicName: clinicInfo.clinicName,
                            clinicLogo: clinicInfo.clinicLogo,
                            therapistName: clinicInfo.therapistName,
                            therapistLicenseNo: clinicInfo.therapistLicenseNo,
                            updatedAt: now,
                        });
                    });
                    stmt.finalize();
                }
                else {
                    // 새로 생성
                    const stmt = this.db.prepare(`
              INSERT INTO clinic_info (user_id, clinic_name, clinic_logo, therapist_name, therapist_license_no, updated_at)
              VALUES (?, ?, ?, ?, ?, ?)
            `);
                    stmt.run([
                        userId,
                        clinicInfo.clinicName,
                        clinicInfo.clinicLogo,
                        clinicInfo.therapistName,
                        clinicInfo.therapistLicenseNo,
                        now
                    ], function (err) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve({
                            id: this.lastID,
                            userId,
                            clinicName: clinicInfo.clinicName,
                            clinicLogo: clinicInfo.clinicLogo,
                            therapistName: clinicInfo.therapistName,
                            therapistLicenseNo: clinicInfo.therapistLicenseNo,
                            updatedAt: now,
                        });
                    });
                    stmt.finalize();
                }
            });
        });
    }
    // 백업 생성
    async createBackup(userId) {
        const backupDir = path.join(electron_1.app.getPath('documents'), 'PatientChartBackups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(backupDir, `backup_${userId}_${timestamp}.db`);
        return new Promise((resolve, reject) => {
            fs.copyFile(this.dbPath, backupPath, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(backupPath);
            });
        });
    }
    // 백업 복원
    async restoreBackup(backupPath) {
        return new Promise((resolve, reject) => {
            // 현재 DB 백업
            const currentBackup = this.dbPath + '.backup';
            fs.copyFile(this.dbPath, currentBackup, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                // 백업 파일로 복원
                fs.copyFile(backupPath, this.dbPath, (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    // 데이터베이스 재연결
                    this.db.close(() => {
                        this.initialize().then(resolve).catch(reject);
                    });
                });
            });
        });
    }
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    close() {
        if (this.db) {
            this.db.close();
        }
    }
}
exports.Database = Database;
//# sourceMappingURL=database.js.map
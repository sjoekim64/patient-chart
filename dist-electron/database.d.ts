export interface User {
    id: string;
    username: string;
    passwordHash: string;
    clinicName: string;
    therapistName: string;
    therapistLicenseNo: string;
    createdAt: string;
}
export interface PatientChart {
    id?: number;
    fileNo: string;
    userId: string;
    chartType: 'new' | 'follow-up';
    chartData: string;
    date: string;
    createdAt: string;
    updatedAt: string;
}
export interface ClinicInfo {
    id?: number;
    userId: string;
    clinicName: string;
    clinicLogo: string;
    therapistName: string;
    therapistLicenseNo: string;
    updatedAt: string;
}
export declare class Database {
    private db;
    private dbPath;
    constructor();
    initialize(): Promise<void>;
    private createTables;
    registerUser(userData: {
        username: string;
        password: string;
        clinicName: string;
        therapistName: string;
        therapistLicenseNo: string;
    }): Promise<{
        user: User;
        token: string;
    }>;
    loginUser(credentials: {
        username: string;
        password: string;
    }): Promise<{
        user: User;
        token: string;
    }>;
    verifyToken(token: string): Promise<User>;
    getPatientCharts(userId: string): Promise<PatientChart[]>;
    savePatientChart(userId: string, patientData: any): Promise<PatientChart>;
    deletePatientChart(userId: string, fileNo: string): Promise<void>;
    getClinicInfo(userId: string): Promise<ClinicInfo | null>;
    saveClinicInfo(userId: string, clinicInfo: any): Promise<ClinicInfo>;
    createBackup(userId: string): Promise<string>;
    restoreBackup(backupPath: string): Promise<void>;
    private generateId;
    close(): void;
}
//# sourceMappingURL=database.d.ts.map
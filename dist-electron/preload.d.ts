declare global {
    interface Window {
        electronAPI: {
            auth: {
                register: (userData: any) => Promise<any>;
                login: (credentials: any) => Promise<any>;
                verify: (token: string) => Promise<any>;
            };
            patients: {
                getAll: (userId: string) => Promise<any>;
                save: (userId: string, patientData: any) => Promise<any>;
                delete: (userId: string, fileNo: string) => Promise<any>;
            };
            clinic: {
                getInfo: (userId: string) => Promise<any>;
                saveInfo: (userId: string, clinicInfo: any) => Promise<any>;
            };
            backup: {
                create: (userId: string) => Promise<any>;
                restore: (backupPath: string) => Promise<any>;
            };
            dialog: {
                openFile: () => Promise<any>;
                saveFile: () => Promise<any>;
            };
        };
    }
}
export {};
//# sourceMappingURL=preload.d.ts.map
import type { Firestore } from '@google-cloud/firestore';
import type { Env } from '../config/env';

export type ConversionVisibility = 'public' | 'ephemeral' | 'per_member';

export interface WorkspaceSettings {
    conversionVisibility: ConversionVisibility;
    autoConvert: boolean;
}

const COLLECTION = 'workspace-settings';
const DEFAULT_SETTINGS: WorkspaceSettings = { conversionVisibility: 'public', autoConvert: false };

let settingsDb: Firestore | null = null;
let settingsEnv: Env | null = null;

export const initWorkspaceSettings = (db: Firestore | null, env: Env): void => {
    settingsDb = db;
    settingsEnv = env;
};

export const isSettingsEditable = (): boolean => settingsDb !== null;

const parseVisibility = (value: unknown): ConversionVisibility => {
    if (value === 'ephemeral' || value === 'per_member') return value;
    return 'public';
};

const visibilityFromEnv = (): ConversionVisibility => {
    return parseVisibility(settingsEnv?.CONVERSION_MESSAGE_VISIBILITY);
};

const autoConvertFromEnv = (): boolean => {
    return settingsEnv?.AUTO_CONVERT ?? false;
};

export const getWorkspaceSettings = async (teamId: string): Promise<WorkspaceSettings> => {
    if (!settingsDb) {
        return {
            conversionVisibility: visibilityFromEnv(),
            autoConvert: autoConvertFromEnv(),
        };
    }

    const doc = await settingsDb.collection(COLLECTION).doc(teamId).get();
    if (!doc.exists) return DEFAULT_SETTINGS;

    const data = doc.data() as Partial<WorkspaceSettings> | undefined;

    return {
        conversionVisibility: parseVisibility(data?.conversionVisibility),
        autoConvert: data?.autoConvert === true,
    };
};

export const saveWorkspaceSettings = async (teamId: string, partial: Partial<WorkspaceSettings>): Promise<void> => {
    if (!settingsDb) {
        throw new Error('Workspace settings require Firebase in multi-workspace mode');
    }

    const current = await getWorkspaceSettings(teamId);
    await settingsDb
        .collection(COLLECTION)
        .doc(teamId)
        .set({ ...current, ...partial }, { merge: true });
};

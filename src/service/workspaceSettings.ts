import type { Firestore } from '@google-cloud/firestore';
import type { Env } from '../config/env';

export type ConversionVisibility = 'public' | 'ephemeral';

export interface WorkspaceSettings {
    conversionVisibility: ConversionVisibility;
}

const COLLECTION = 'workspace-settings';
const DEFAULT_SETTINGS: WorkspaceSettings = { conversionVisibility: 'public' };

let settingsDb: Firestore | null = null;
let settingsEnv: Env | null = null;

export const initWorkspaceSettings = (db: Firestore | null, env: Env): void => {
    settingsDb = db;
    settingsEnv = env;
};

export const isSettingsEditable = (): boolean => settingsDb !== null;

const visibilityFromEnv = (): ConversionVisibility => {
    const value = settingsEnv?.CONVERSION_MESSAGE_VISIBILITY;
    return value === 'ephemeral' ? 'ephemeral' : 'public';
};

export const getWorkspaceSettings = async (teamId: string): Promise<WorkspaceSettings> => {
    if (!settingsDb) {
        return { conversionVisibility: visibilityFromEnv() };
    }

    const doc = await settingsDb.collection(COLLECTION).doc(teamId).get();
    if (!doc.exists) return DEFAULT_SETTINGS;

    const data = doc.data() as Partial<WorkspaceSettings> | undefined;
    const visibility = data?.conversionVisibility === 'ephemeral' ? 'ephemeral' : 'public';

    return { conversionVisibility: visibility };
};

export const saveWorkspaceSettings = async (teamId: string, settings: WorkspaceSettings): Promise<void> => {
    if (!settingsDb) {
        throw new Error('Workspace settings require Firebase in multi-workspace mode');
    }

    await settingsDb.collection(COLLECTION).doc(teamId).set(settings, { merge: true });
};

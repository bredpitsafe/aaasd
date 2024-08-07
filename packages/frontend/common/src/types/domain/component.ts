import type { ISO, Opaque } from '@common/types';

import type { TUser } from '../../modules/user';
import type { TGate, TGateId } from './gates';
import type { TRobot, TRobotId } from './robots';

export enum EComponentStatus {
    Initializing = 'Initializing',
    Enabled = 'Enabled',
    Disabled = 'Disabled',
    Failed = 'Failed',
    Alarming = 'Alarming',
    Terminating = 'Terminating',
    Rejected = 'Rejected',
    Unknown = 'Unknown',
}

export enum EComponentType {
    mdGate = 'mdGate',
    execGate = 'execGate',
    robot = 'robot',
}

export enum EComponentConfigType {
    mdGate = 'MdGate',
    execGate = 'ExecGate',
    robot = 'Robot',
    dashboard = 'Dashboard',
}

export type TComponent = TGate | TRobot;

export type TComponentTypeToType = {
    [EComponentType.mdGate]: TGate;
    [EComponentType.execGate]: TGate;
    [EComponentType.robot]: TRobot;
};

export type TComponentId = TGateId | TRobotId;

export type TComponentTypeToTypeId = {
    [EComponentType.mdGate]: TGateId;
    [EComponentType.execGate]: TGateId;
    [EComponentType.robot]: TRobotId;
};

export type TLogId = Opaque<'UserId', number>;

export type TLog = {
    id: TLogId;
    message: string;
};

export type TClientComponentConfig = {
    raw: string;
    digest: string;
    updatedBy: TUser;
    updatedAt: ISO;
    componentId: TComponentId;
};

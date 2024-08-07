import { extractErrorMessage } from '@backend/utils/src/general.ts';
import type { TraceId } from '@common/utils';
import { assert, generateTraceId } from '@common/utils';
import type {
    TSubscribeToUserSettingsResponseUpdates,
    TUpsertUserSettingsRequestParams,
    TUserSetting,
} from '@grpc-schemas/user_settings-api-sdk/index.services.user_settings.v1.js';
import type { user_settings as User_setting } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { omit } from 'lodash-es';
import pg from 'pg';
import type { Observable } from 'rxjs';
import { bufferTime, filter, map, Subject, switchMap } from 'rxjs';

import { EActorName } from '../../defs/actors.ts';
import { appConfig } from '../../utils/appConfig.ts';
import { extractAppNameFrom } from '../../utils/index.ts';
import { defaultLogger } from '../../utils/logger.ts';
const { Client } = pg;

const PG_TABLE_UPDATES_NOTIFICATION_CHANNEL = 'notification_channel_for_service';
type TEventType = 'insertion' | 'update' | 'deletion';
type TUpdateMessage = `${TEventType}|${string}`;
const BATCH_NOTIFICATIONS_BUFFER_TIME = 500;

type TSettingsFilter = {
    username: string;
    app?: {
        appName: string;
        keys?: string[];
    };
    traceId: TraceId;
};

class Repository {
    private prismaClient = new PrismaClient();
    private pgClient: pg.Client;
    private updatesSubject = new Subject<{
        eventType: TEventType;
        row: Omit<User_setting, 'value'>;
    }>();
    private logger = defaultLogger.createChildLogger({
        actor: EActorName.Repository,
    });

    constructor() {
        this.constructConnectionString();

        this.pgClient = new Client({
            connectionString: process.env.DATABASE_URL,
        });
    }

    private constructConnectionString() {
        const { username, password, host, port, databaseName, schema } = appConfig.postgres;

        const requiredDbParams = Object.values(omit(appConfig.postgres, 'password'));
        assert(
            requiredDbParams.filter(Boolean).length === requiredDbParams.length,
            'Invalid db connection string. You are missing some params',
        );

        process.env.DATABASE_URL = `postgresql://${username}:${password}@${host}:${port}/${databaseName}?schema=${schema}`;

        this.logger.debug({
            traceId: generateTraceId(),
            message: `DATABASE_URL: ${process.env.DATABASE_URL}`,
        });
    }

    async connect(chainedTraceId?: TraceId) {
        const traceId = chainedTraceId ?? generateTraceId();
        const logger = this.logger.createChildLogger({
            traceId,
        });

        try {
            await this.prismaClient.$connect();
            await this.connectPgClient(traceId);

            logger.info({
                message: 'Connected to DB',
            });

            await this.subscribeToUpdatesChannel(traceId);
        } catch (error) {
            logger.error({
                message: `Failed to connect to DB or subscribe to ${PG_TABLE_UPDATES_NOTIFICATION_CHANNEL}`,
                errorMessage: extractErrorMessage(error),
                error,
            });
            throw error;
        }
    }

    private async connectPgClient(traceId: TraceId) {
        try {
            await this.pgClient.connect();
        } catch (e) {
            const alreadyConnectedErrorMessage = 'Client has already been connected';
            const error = e as Error;
            if (error.message.includes(alreadyConnectedErrorMessage)) {
                this.logger.debug({ message: alreadyConnectedErrorMessage, traceId });
            } else {
                throw error;
            }
        }
    }

    async disconnect() {
        const logger = defaultLogger.createChildLogger({
            actor: EActorName.Repository,
            traceId: generateTraceId(),
        });

        try {
            await this.prismaClient.$disconnect();
            await this.pgClient.query(`UNLISTEN ${PG_TABLE_UPDATES_NOTIFICATION_CHANNEL}`);
            this.updatesSubject.complete();
            this.pgClient.removeAllListeners('notification');
            this.pgClient.end();
            logger.info({
                message: `Disconnected from DB and disposed everything`,
            });
        } catch (error) {
            logger.error({
                message: `Couldn't disconnect from DB or dispose something`,
                error: extractErrorMessage(error),
            });
        }
    }

    async healthcheck() {
        await this.connect();
        await this.prismaClient.user_settings.findFirst();
        await this.pgClient.query('SELECT 1');
    }

    private async subscribeToUpdatesChannel(traceId: TraceId) {
        const logger = this.logger.createChildLogger({ traceId });

        const listeningChannels = await this.pgClient.query(
            'SELECT * FROM pg_listening_channels()',
        );

        if (listeningChannels.rowCount === 0) {
            if (this.pgClient.listeners('notification').length === 0) {
                this.pgClient.on('notification', this.handleNotificaiton);
            }

            await this.pgClient.query(`LISTEN ${PG_TABLE_UPDATES_NOTIFICATION_CHANNEL}`);

            logger.info({
                message: `Subscribed to ${PG_TABLE_UPDATES_NOTIFICATION_CHANNEL}`,
            });
        }
    }

    private handleNotificaiton = (notification: pg.Notification) => {
        const logger = defaultLogger.createChildLogger({
            actor: EActorName.Repository,
            traceId: generateTraceId(),
        });
        if (!notification.payload) {
            logger.error({
                message: `No payload found on table update notification`,
            });

            return;
        }

        const updateMessage = notification.payload as TUpdateMessage;
        const [eventType, jsonRow] = updateMessage.split('|') as [TEventType, string];
        const row = JSON.parse(jsonRow);

        this.updatesSubject.next({ eventType, row });
        logger.info({
            message: `Received row change notification`,
            rawPayload: notification.payload,
        });
        logger.debug({
            message: `Received row change notification`,
            payload: { eventType, row },
        });
    };

    async getSnapshot({ username, app, traceId }: TSettingsFilter) {
        this.connect(traceId);

        const settings = await this.prismaClient.user_settings.findMany({
            where: {
                username,
                ...(app
                    ? {
                          tags: { has: app.appName },
                          ...(app.keys && app.keys.length > 0
                              ? {
                                    key: { in: app.keys },
                                }
                              : {}),
                      }
                    : {}),
            },
            select: {
                id: true,
                key: true,
                tags: true,
                value: true,
            },
        });

        return settings.map(({ id, key, tags, value }) => {
            return {
                id,
                key,
                appName: extractAppNameFrom(tags),
                value,
            };
        });
    }

    upsertUserSettings(
        username: string,
        settingsToUpsert: TUpsertUserSettingsRequestParams['settings'],
        traceId: TraceId,
    ) {
        this.connect(traceId);

        return this.prismaClient.$transaction(async (client) => {
            for (const settingToUpsert of settingsToUpsert) {
                const tags = [settingToUpsert.appName];
                const { key, value } = settingToUpsert;

                await client.user_settings.upsert({
                    where: {
                        username_key_tags: {
                            username,
                            key,
                            tags,
                        },
                    },
                    update: {
                        value,
                        tags,
                    },
                    create: {
                        username,
                        key,
                        tags,
                        value,
                    },
                });
            }
        });
    }

    removeUserSettings({ username, app, traceId }: TSettingsFilter) {
        this.connect(traceId);

        return this.prismaClient.$transaction(async (client) => {
            const idsToRemove = (
                await client.user_settings.findMany({
                    where: {
                        username,
                        ...(app
                            ? {
                                  tags: { has: app.appName },
                                  ...(app.keys && app.keys.length > 0
                                      ? {
                                            key: { in: app.keys },
                                        }
                                      : {}),
                              }
                            : {}),
                    },
                    select: {
                        id: true,
                    },
                })
            ).map(({ id }) => id);

            const { count } = await client.user_settings.deleteMany({
                where: {
                    id: { in: idsToRemove },
                },
            });

            return { idsToRemove, deletedCount: count };
        });
    }

    subscribeToUpdates({
        username,
        app,
        traceId,
    }: TSettingsFilter): Observable<TSubscribeToUserSettingsResponseUpdates> {
        this.connect(traceId);

        return this.updatesSubject.pipe(
            bufferTime(BATCH_NOTIFICATIONS_BUFFER_TIME),
            map((updates) =>
                updates.filter(
                    (update) =>
                        update.row.username === username &&
                        (app
                            ? app.appName === extractAppNameFrom(update.row.tags) &&
                              (app.keys && app.keys.length > 0
                                  ? app.keys.includes(update.row.key)
                                  : true)
                            : true),
                ),
            ),
            filter((updates) => updates.length > 0),
            map((updates) => ({
                upserted: updates
                    .filter(
                        (update) =>
                            update.eventType === 'insertion' || update.eventType === 'update',
                    )
                    .map(({ row: { id, key, tags } }) => ({
                        id,
                        key,
                        appName: extractAppNameFrom(tags),
                    })),
                removed: updates
                    .filter((update) => update.eventType === 'deletion')
                    .map(({ row: { id } }) => ({ id })),
            })),
            switchMap(async ({ upserted: upsertedRowsWithoutValue, removed }) => {
                const upserted = await this.getUpsertedRowsWithValues(upsertedRowsWithoutValue);

                return { upserted, removed };
            }),
        );
    }

    private async getUpsertedRowsWithValues(
        upsertedRowsWithoutValue: Omit<TUserSetting, 'value'>[],
    ) {
        return (
            await this.prismaClient.user_settings.findMany({
                where: { id: { in: upsertedRowsWithoutValue.map((row) => row.id!) } },
                select: { id: true, key: true, tags: true, value: true },
            })
        ).map(({ id, key, tags, value }) => ({
            id,
            key,
            appName: extractAppNameFrom(tags),
            value,
        }));
    }
}

export const repository = new Repository();

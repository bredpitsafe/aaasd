import '../../utils/Rx/internalProviders';

import { connectActorToActor, connectMessagePortToActor, onConnectMessagePort } from 'webactor';

import { createLazyActorBacktestingDataProviders } from '../../actors/BacktestingDataProviders/lazy';
import { createLazyActorChartsDataProvider } from '../../actors/ChartsDataProvider/lazy';
import { createLazyActorDashboardsStorage } from '../../actors/DashboardsStorage/lazy';
import { createLazyActorDictionaries } from '../../actors/Dictionaries/lazy';
import { createActorHandlers } from '../../actors/Handlers';
import { createActorHeartbeat } from '../../actors/Heartbeat';
import { createLazyActorHerodotusTasks } from '../../actors/HerodotusTasks/lazy';
import { createLazyActorInfinityHistory } from '../../actors/InfinityHistory/lazy';
import { createActorMetrics } from '../../actors/Metrics';
import { createLazyActorPortfolioTrackerDataProvider } from '../../actors/PortfolioTrackerDataProvider/lazy';
import { createActorRoot } from '../../actors/Root';
import { createActorSettings } from '../../actors/Settings';
import { createLazyTradingServersManagerDataProvider } from '../../actors/TradingServersManager/lazy';
import { EWorkerName } from '../defs';
import { setupWorkerThread } from '../utils/setupWorkerThread';

const sharedWorkerContext = self as unknown as SharedWorkerGlobalScope;

const root = createActorRoot();
const metrics = createActorMetrics();
const handlers = createActorHandlers();
const settings = createActorSettings();
const dictionaries = createLazyActorDictionaries();
const infinityHistory = createLazyActorInfinityHistory();
const chartsDataProvider = createLazyActorChartsDataProvider();
const backtestingDataProviders = createLazyActorBacktestingDataProviders();
const portfolioTrackerDataProvider = createLazyActorPortfolioTrackerDataProvider();
const dashboardsStorage = createLazyActorDashboardsStorage();
const tradingServersManagerDataProvider = createLazyTradingServersManagerDataProvider();
const herodotusTasksActor = createLazyActorHerodotusTasks();
const heartbeatActor = createActorHeartbeat();

connectActorToActor(root, metrics);
connectActorToActor(root, handlers);
connectActorToActor(root, settings);
connectActorToActor(root, dictionaries);
connectActorToActor(root, infinityHistory);
connectActorToActor(root, chartsDataProvider);
connectActorToActor(root, backtestingDataProviders);
connectActorToActor(root, portfolioTrackerDataProvider);
connectActorToActor(root, dashboardsStorage);
connectActorToActor(root, tradingServersManagerDataProvider);
connectActorToActor(root, herodotusTasksActor);
connectActorToActor(root, heartbeatActor);

root.launch();
metrics.launch();
handlers.launch();
settings.launch();
dictionaries.launch();
infinityHistory.launch();
chartsDataProvider.launch();
backtestingDataProviders.launch();
portfolioTrackerDataProvider.launch();
dashboardsStorage.launch();
tradingServersManagerDataProvider.launch();
herodotusTasksActor.launch();
heartbeatActor.launch();

setupWorkerThread(EWorkerName.SharedRoot, root);

onConnectMessagePort(sharedWorkerContext, (name, port) => {
    return connectMessagePortToActor(port, root);
});

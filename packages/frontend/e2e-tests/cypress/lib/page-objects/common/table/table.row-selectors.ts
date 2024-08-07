import { ETableHeaderSelectors } from './table.header';

export enum ETableRowSelectors {
    ArrowButton = `${ETableHeaderSelectors.TableBody} [aria-colindex="1"] [class="ag-group-contracted "]`,
    ArrowRightsButton = `${ETableHeaderSelectors.TableBody} [aria-colindex="1"] [class="ag-group-expanded "]`,
    IDRowText = `${ETableHeaderSelectors.TableBody} [col-id="id"]`,
    TaskIDRowText = `${ETableHeaderSelectors.TableBody} [col-id="taskId"]`,
    CreatesRowText = `${ETableHeaderSelectors.TableBody} [col-id="createTime"]`,
    NameRowText = `${ETableHeaderSelectors.TableBody} [col-id="name"]`,
    DashboardRowText = `${ETableHeaderSelectors.TableBody} [col-id="dashboard"]`,
    UserNameRowText = `${ETableHeaderSelectors.TableBody} [col-id="username"]`,
    ActualStatusRowText = `${ETableHeaderSelectors.TableBody} [col-id="actualStatus"]`,
    UpdateTimeRowText = `${ETableHeaderSelectors.TableBody} [col-id="updateTime"]`,
    ValueRowText = `${ETableHeaderSelectors.TableBody} [col-id="value"]`,
    ComponentRowText = `${ETableHeaderSelectors.TableBody} [col-id="component"]`,
    PlatformTimeRowText = `${ETableHeaderSelectors.TableBody} [col-id="platformTime"]`,
    ExchangeTimeRowText = `${ETableHeaderSelectors.TableBody} [col-id="exchangeTime"]`,
    MakerRowText = `${ETableHeaderSelectors.TableBody} [col-id="market"]`,
    RoleRowText = `${ETableHeaderSelectors.TableBody} [col-id="role"]`,
    PriceRowText = `${ETableHeaderSelectors.TableBody} [col-id="price"]`,
    FeeAmountRowText = `${ETableHeaderSelectors.TableBody} [col-id="feeAmount"]`,
    StatusTaskRowText = `${ETableHeaderSelectors.TableBody} [col-id="status"]`,
    TypeTaskRowText = `${ETableHeaderSelectors.TableBody} [col-id="taskType"]`,
    CoinRowText = `${ETableHeaderSelectors.TableBody} [col-id="coin"]`,
    SourceRowText = `${ETableHeaderSelectors.TableBody} [col-id="source"]`,
    DestinationRowText = `${ETableHeaderSelectors.TableBody} [col-id="destination"]`,
    CoinRuleRowText = `${ETableHeaderSelectors.TableBody} [col-id="coinsMatchRule"]`,
    SourceExchangeRowText = `${ETableHeaderSelectors.TableBody} [col-id="source.exchangesMatchRule"]`,
    SourceAccountRowText = `${ETableHeaderSelectors.TableBody} [col-id="source.accountsMatchRule"]`,
    DestinationExchangeRowText = `${ETableHeaderSelectors.TableBody} [col-id="destination.exchangesMatchRule"]`,
    DestinationAccountRowText = `${ETableHeaderSelectors.TableBody} [col-id="destination.accountsMatchRule"]`,
    BothDirectionsRowText = `${ETableHeaderSelectors.TableBody} [col-id="withOpposite"]`,
    NoteRowText = `${ETableHeaderSelectors.TableBody} [col-id="note"]`,
    InstrumentIdRowText = `${ETableHeaderSelectors.TableBody} [col-id="instrumentId"]`,
    InstrumentRowText = `${ETableHeaderSelectors.TableBody} [col-id="instrumentName"]`,
    VirtualAccountIDRowText = `${ETableHeaderSelectors.TableBody} [col-id="virtualAccountId"]`,
    VirtualAccountRowText = `${ETableHeaderSelectors.TableBody} [col-id="virtualAccountName"]`,
    RobotIDRowText = `${ETableHeaderSelectors.TableBody} [col-id="robotId"]`,
    RobotNameRowText = `${ETableHeaderSelectors.TableBody} [col-id="robotName"]`,
}

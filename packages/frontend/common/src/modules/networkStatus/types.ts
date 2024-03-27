import { Observable } from 'rxjs';

export interface IModuleNetworkStatus {
    online$: Observable<boolean>;
}
